import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import sharp from 'sharp';

import User, { CATEGORIAS_VALIDAS } from './models/User.js';
import AllergenDictionary from './models/AllergenDictionary.js';
import ScanLog from './models/ScanLog.js';
import { DICIONARIO_PADRAO } from './seeds/dicionarioPadrao.js';
import { normalizar, escaparRegex, emailValido } from './utils/texto.js';
import { autenticarJWT, JWT_SECRET } from './middleware/auth.js';
import { extrairTextoDaImagem, analisarTextoRotulo } from './services/ocrAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TMP_UPLOADS_DIR = path.join(UPLOADS_DIR, 'tmp');
const SCANS_UPLOADS_DIR = path.join(UPLOADS_DIR, 'scans');

for (const dir of [UPLOADS_DIR, TMP_UPLOADS_DIR, SCANS_UPLOADS_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configuração do Multer com limite de 8MB e filtro de imagem
const upload = multer({
  dest: TMP_UPLOADS_DIR,
  limits: {
    fileSize: 8 * 1024 * 1024, // 8MB
  },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || '').toLowerCase();
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mimesAceitos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    const extsAceitas = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

    if (mime.startsWith('image/') || mimesAceitos.includes(mime) || extsAceitas.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Formato de arquivo inválido. Envie apenas imagens (JPG, PNG ou WebP).'));
    }
  },
});

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function formatarItemHistorico(doc, incluirDetalhes = false) {
  const obj = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const idStr = String(obj._id);
  const base = {
    id: idStr,
    _id: idStr,
    userId: String(obj.userId),
    nomeProduto: obj.nomeProduto || 'Produto analisado',
    nomeAutomatico: Boolean(obj.nomeAutomatico),
    marcaPeso: obj.marcaPeso || null,
    veredito: obj.veredito,
    alergicosDetectados: Array.isArray(obj.alergicosDetectados) ? obj.alergicosDetectados : [],
    curtido: Boolean(obj.curtido),
    imagemUrl: obj.imagemArquivo ? `/users/historico/${idStr}/imagem` : null,
    imagemDemo: obj.imagemDemo || null,
    seed: Boolean(obj.seed),
    createdAt: obj.createdAt,
    updatedAt: obj.updatedAt,
  };

  if (incluirDetalhes) {
    base.ingredientesDetalhados = Array.isArray(obj.ingredientesDetalhados)
      ? obj.ingredientesDetalhados
      : [];
    base.textoBruto = obj.textoBruto || '';
  }

  return base;
}

function validarRestricoesENiveis(restricoes, niveisSensibilidade, exigirAoMenosUma = true) {
  if (!Array.isArray(restricoes)) {
    return { erro: 'O campo restricoes deve ser uma lista.' };
  }

  const restricoesLimpas = [];
  for (const r of restricoes) {
    const norm = normalizar(String(r));
    if (!CATEGORIAS_VALIDAS.includes(norm)) {
      return { erro: `Restrição inválida: "${r}". Valores aceitos: gluten, lactose, amendoim.` };
    }
    if (!restricoesLimpas.includes(norm)) {
      restricoesLimpas.push(norm);
    }
  }

  if (exigirAoMenosUma && restricoesLimpas.length === 0) {
    return { erro: 'Selecione ao menos uma intolerância' };
  }

  const niveisLimpos = {
    gluten: 1,
    lactose: 1,
    amendoim: 1,
  };

  if (niveisSensibilidade && typeof niveisSensibilidade === 'object') {
    for (const cat of CATEGORIAS_VALIDAS) {
      if (niveisSensibilidade[cat] !== undefined) {
        const val = Number(niveisSensibilidade[cat]);
        if (![0, 1, 2].includes(val)) {
          return {
            erro: `Nível de sensibilidade inválido para ${cat}. Use 0 (Leve), 1 (Moderado) ou 2 (Grave).`,
          };
        }
        niveisLimpos[cat] = val;
      }
    }
  }

  return { restricoes: restricoesLimpas, niveisSensibilidade: niveisLimpos };
}

/**
 * Calcula estatísticas do usuário no fuso America/Sao_Paulo:
 * - escaneamentosSegurosMes (mês calendário atual em SP)
 * - diasConsecutivos (streak de dias com ao menos 1 scan terminando hoje ou ontem em SP)
 * - totalScans
 * - metaMensal: 50
 */
async function calcularStatsUsuario(userId) {
  const agora = new Date();
  const formatadorDataSP = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Data atual em SP no formato YYYY-MM-DD
  const hojeSPStr = formatadorDataSP.format(agora);
  const [anoSP, mesSP] = hojeSPStr.split('-').map(Number);

  // Início do mês atual em America/Sao_Paulo (UTC-3 => 03:00 UTC do dia 1)
  const inicioMesSP = new Date(Date.UTC(anoSP, mesSP - 1, 1, 3, 0, 0, 0));

  const [totalScans, escaneamentosSegurosMes, logsDatas] = await Promise.all([
    ScanLog.countDocuments({ userId }),
    ScanLog.countDocuments({
      userId,
      veredito: 'SEGURO',
      createdAt: { $gte: inicioMesSP },
    }),
    ScanLog.find({ userId }).select('createdAt').sort({ createdAt: -1 }).limit(365).lean(),
  ]);

  let diasConsecutivos = 0;
  if (logsDatas.length > 0) {
    const diasComScan = new Set(
      logsDatas
        .filter((l) => l.createdAt)
        .map((l) => formatadorDataSP.format(new Date(l.createdAt)))
    );

    const somarDias = (yyyyMmDd, delta) => {
      const [y, m, d] = yyyyMmDd.split('-').map(Number);
      const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
      dt.setUTCDate(dt.getUTCDate() + delta);
      return dt.toISOString().slice(0, 10);
    };

    const ontemSPStr = somarDias(hojeSPStr, -1);
    let cursorDia = null;
    if (diasComScan.has(hojeSPStr)) {
      cursorDia = hojeSPStr;
    } else if (diasComScan.has(ontemSPStr)) {
      cursorDia = ontemSPStr;
    }

    while (cursorDia && diasComScan.has(cursorDia)) {
      diasConsecutivos++;
      cursorDia = somarDias(cursorDia, -1);
    }
  }

  return {
    escaneamentosSegurosMes,
    diasConsecutivos,
    totalScans,
    metaMensal: 50,
  };
}

// ============================================================================
// INICIALIZAÇÃO DO DICIONÁRIO (IDEMPOTENTE, SEM OPERAÇÕES DESTRUTIVAS)
// ============================================================================

async function inicializarDicionarioPadrao() {
  try {
    for (const [categoria, sinonimosPadrao] of Object.entries(DICIONARIO_PADRAO)) {
      await AllergenDictionary.findOneAndUpdate(
        { categoria },
        {
          $setOnInsert: { categoria },
          $addToSet: { sinonimos: { $each: sinonimosPadrao } },
        },
        { upsert: true, returnDocument: 'after' }
      );
    }
    const totalCategorias = await AllergenDictionary.countDocuments();
    console.log(`Dicionário de alérgenos pronto (${totalCategorias} categorias registradas).`);
  } catch (err) {
    console.error('Erro ao inicializar AllergenDictionary:', err.message);
  }
}

// ============================================================================
// ROTAS DE AUTENTICAÇÃO
// ============================================================================

async function handlerRegister(req, res) {
  try {
    const {
      nome,
      email,
      senha,
      restricoes = [],
      niveisSensibilidade,
      avatar = null,
    } = req.body || {};

    if (!nome || typeof nome !== 'string' || !nome.trim()) {
      return res.status(400).json({ erro: 'Informe seu nome completo.' });
    }

    if (!emailValido(email)) {
      return res.status(400).json({ erro: 'Informe um endereço de e-mail válido.' });
    }

    if (!senha || typeof senha !== 'string' || senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve ter pelo menos 6 caracteres.' });
    }

    const validacao = validarRestricoesENiveis(restricoes, niveisSensibilidade, true);
    if (validacao.erro) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const emailNorm = email.trim().toLowerCase();
    const existente = await User.findOne({ email: emailNorm });
    if (existente) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const novoUsuario = await User.create({
      nome: nome.trim(),
      email: emailNorm,
      senha: senhaHash,
      avatar,
      role: 'PACIENTE',
      restricoes: validacao.restricoes,
      niveisSensibilidade: validacao.niveisSensibilidade,
      restricoesAtualizadasEm: new Date(),
      restricoesAtualizadasPor: 'PACIENTE',
    });

    const token = jwt.sign(
      { id: String(novoUsuario._id), email: novoUsuario.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso!',
      token,
      usuario: novoUsuario.toPublic(),
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ erro: 'Este e-mail já está cadastrado.' });
    }
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ erro: 'Erro interno ao realizar o cadastro.' });
  }
}

app.post('/auth/register', handlerRegister);
app.post('/api/cadastro', handlerRegister);

async function handlerLogin(req, res) {
  try {
    const { email, senha } = req.body || {};
    if (!email || !senha) {
      return res.status(400).json({ erro: 'Preencha e-mail e senha.' });
    }

    const emailNorm = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: emailNorm }).select('+senha');

    // Fallback transparente caso o usuário ainda esteja apenas na coleção legada `usuarios`
    if (!user && mongoose.connection.readyState === 1) {
      const legado = await mongoose.connection.db
        .collection('usuarios')
        .findOne({ email: { $regex: `^${ emailNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') }$`, $options: 'i' } });

      if (legado) {
        const senhaLegada = legado.senha || '';
        const ehHash = /^\$2[aby]\$/.test(senhaLegada);
        const senhaConfere = ehHash
          ? await bcrypt.compare(senha, senhaLegada)
          : senha === senhaLegada;

        if (!senhaConfere) {
          return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
        }

        const hashFinal = ehHash ? senhaLegada : await bcrypt.hash(senha, 10);
        const restricoesLegadas = Array.isArray(legado.restricoes)
          ? legado.restricoes
              .map((r) => normalizar(String(r)))
              .filter((r) => CATEGORIAS_VALIDAS.includes(r))
          : [];

        user = await User.create({
          nome: legado.nome || legado.name || 'Usuário',
          email: emailNorm,
          senha: hashFinal,
          role: 'PACIENTE',
          restricoes: restricoesLegadas,
          niveisSensibilidade: { gluten: 1, lactose: 1, amendoim: 1 },
          restricoesAtualizadasEm: new Date(),
          restricoesAtualizadasPor: 'PACIENTE',
        });
      }
    }

    if (!user) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const senhaArmazenada = user.senha || '';
    const ehBcrypt = /^\$2[aby]\$/.test(senhaArmazenada);
    let senhaValida = false;

    if (ehBcrypt) {
      senhaValida = await bcrypt.compare(senha, senhaArmazenada);
    } else if (senhaArmazenada) {
      senhaValida = senha === senhaArmazenada;
      if (senhaValida) {
        user.senha = await bcrypt.hash(senha, 10);
        await user.save();
      }
    }

    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos.' });
    }

    const token = jwt.sign(
      { id: String(user._id), email: user.email },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso!',
      token,
      usuario: user.toPublic(),
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro interno no servidor ao realizar login.' });
  }
}

app.post('/auth/login', handlerLogin);
app.post('/api/login', handlerLogin);

// ============================================================================
// ROTAS DE PERFIL E RESTRIÇÕES (JWT)
// ============================================================================

app.get('/users/perfil', autenticarJWT, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const stats = await calcularStatsUsuario(user._id);
    const publicUser = user.toPublic();

    return res.json({
      ...publicUser,
      usuario: publicUser,
      stats,
    });
  } catch (err) {
    console.error('Erro em GET /users/perfil:', err);
    return res.status(500).json({ erro: 'Erro ao carregar perfil do usuário.' });
  }
});

app.put('/users/restricoes', autenticarJWT, async (req, res) => {
  try {
    const { restricoes, niveisSensibilidade } = req.body || {};
    const validacao = validarRestricoesENiveis(restricoes, niveisSensibilidade, true);
    if (validacao.erro) {
      return res.status(400).json({ erro: validacao.erro });
    }

    const atualizado = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          restricoes: validacao.restricoes,
          niveisSensibilidade: validacao.niveisSensibilidade,
          restricoesAtualizadasEm: new Date(),
          restricoesAtualizadasPor: 'PACIENTE',
        },
      },
      { returnDocument: 'after' }
    );

    if (!atualizado) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const publicUser = atualizado.toPublic();
    return res.json({
      sucesso: true,
      mensagem: 'Intolerâncias e níveis atualizados com sucesso!',
      ...publicUser,
      usuario: publicUser,
    });
  } catch (err) {
    console.error('Erro em PUT /users/restricoes:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar intolerâncias.' });
  }
});

async function handlerAtualizarPerfil(req, res) {
  try {
    const userId = req.userId || req.body?.id;
    if (!userId) {
      return res.status(401).json({ erro: 'Não autenticado.' });
    }

    const user = await User.findById(userId).select('+senha');
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const {
      nome,
      email,
      avatar,
      senhaAtual,
      novaSenha,
      senha,
      restricoes,
      niveisSensibilidade,
    } = req.body || {};

    if (nome !== undefined) {
      if (!String(nome).trim()) {
        return res.status(400).json({ erro: 'O nome não pode ficar vazio.' });
      }
      user.nome = String(nome).trim();
    }

    if (email !== undefined) {
      const emailNorm = String(email).trim().toLowerCase();
      if (!emailValido(emailNorm)) {
        return res.status(400).json({ erro: 'Informe um e-mail válido.' });
      }
      if (emailNorm !== user.email) {
        const duplicado = await User.findOne({ email: emailNorm, _id: { $ne: user._id } });
        if (duplicado) {
          return res.status(409).json({ erro: 'Este e-mail já está em uso por outra conta.' });
        }
        user.email = emailNorm;
      }
    }

    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    // Troca de senha (exige senhaAtual + novaSenha >= 6)
    const senhaNovaCandidata = novaSenha || (senha && String(senha).trim() ? String(senha).trim() : null);
    if (senhaNovaCandidata) {
      if (senhaNovaCandidata.length < 6) {
        return res.status(400).json({ erro: 'A nova senha deve ter pelo menos 6 caracteres.' });
      }
      if (!senhaAtual) {
        return res.status(400).json({ erro: 'Informe a senha atual para alterar a senha.' });
      }
      const ehBcrypt = /^\$2[aby]\$/.test(user.senha || '');
      const confere = ehBcrypt
        ? await bcrypt.compare(senhaAtual, user.senha)
        : senhaAtual === user.senha;

      if (!confere) {
        return res.status(400).json({ erro: 'A senha atual está incorreta.' });
      }
      user.senha = await bcrypt.hash(senhaNovaCandidata, 10);
    }

    if (Array.isArray(restricoes)) {
      const validacao = validarRestricoesENiveis(
        restricoes,
        niveisSensibilidade || user.niveisSensibilidade,
        true
      );
      if (validacao.erro) {
        return res.status(400).json({ erro: validacao.erro });
      }
      user.restricoes = validacao.restricoes;
      user.niveisSensibilidade = validacao.niveisSensibilidade;
      user.restricoesAtualizadasEm = new Date();
      user.restricoesAtualizadasPor = 'PACIENTE';
    }

    await user.save();
    const publicUser = user.toPublic();

    return res.json({
      sucesso: true,
      mensagem: 'Perfil atualizado com sucesso!',
      ...publicUser,
      usuario: publicUser,
    });
  } catch (err) {
    console.error('Erro em PUT /users/perfil:', err);
    return res.status(500).json({ erro: 'Erro interno ao atualizar perfil.' });
  }
}

app.put('/users/perfil', autenticarJWT, handlerAtualizarPerfil);
app.put('/api/usuario/atualizar', autenticarJWT, handlerAtualizarPerfil);

app.post(
  '/users/avatar',
  autenticarJWT,
  (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ erro: err.message || 'Erro no envio do avatar.' });
      }
      return next();
    });
  },
  async (req, res) => {
    const caminhoTemp = req.file?.path;
    try {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' });
      }

      if (caminhoTemp) {
        const bufferCompactado = await sharp(caminhoTemp)
          .rotate()
          .resize(240, 240, { fit: 'cover' })
          .jpeg({ quality: 80 })
          .toBuffer();

        user.avatar = `data:image/jpeg;base64,${bufferCompactado.toString('base64')}`;
      } else if (req.body?.avatar !== undefined) {
        user.avatar = req.body.avatar;
      } else {
        return res.status(400).json({ erro: 'Nenhuma imagem de avatar foi enviada.' });
      }

      await user.save();
      const publicUser = user.toPublic();
      return res.json({
        sucesso: true,
        mensagem: 'Foto de perfil atualizada com sucesso!',
        avatar: user.avatar,
        ...publicUser,
        usuario: publicUser,
      });
    } catch (err) {
      console.error('Erro em POST /users/avatar:', err);
      return res.status(500).json({ erro: 'Erro ao atualizar a foto de perfil.' });
    } finally {
      try {
        if (caminhoTemp && fs.existsSync(caminhoTemp)) {
          await fs.promises.unlink(caminhoTemp);
        }
      } catch {
        // ignora erro de limpeza do temporário
      }
    }
  }
);

app.delete('/users/me', autenticarJWT, async (req, res) => {
  try {
    const userId = String(req.userId);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    // 1. Apaga os ScanLogs pertencentes ao próprio usuário
    await ScanLog.deleteMany({ userId: user._id });

    // 2. Remove a pasta de thumbnails do usuário se existir
    const pastaScansUsuario = path.join(SCANS_UPLOADS_DIR, userId);
    if (fs.existsSync(pastaScansUsuario)) {
      await fs.promises.rm(pastaScansUsuario, { recursive: true, force: true });
    }

    // 3. Remove o documento User
    await User.findByIdAndDelete(user._id);

    return res.json({
      sucesso: true,
      mensagem: 'Sua conta e todo o histórico foram excluídos permanentemente.',
    });
  } catch (err) {
    console.error('Erro em DELETE /users/me:', err);
    return res.status(500).json({ erro: 'Erro ao excluir a conta.' });
  }
});

// ============================================================================
// ROTAS DE HISTÓRICO E CURTIDOS (JWT)
// ============================================================================

app.get('/users/historico', autenticarJWT, async (req, res) => {
  try {
    const {
      filtro = 'Todos',
      busca = '',
      curtido,
      limit = '30',
      page = '1',
    } = req.query;

    const query = { userId: req.userId };

    const filtroNorm = String(filtro).toLowerCase();
    if (filtroNorm === 'risco' || filtroNorm === 'perigoso') {
      query.veredito = 'PERIGOSO';
    } else if (filtroNorm === 'seguro') {
      query.veredito = 'SEGURO';
    }

    if (String(curtido).toLowerCase() === 'true') {
      query.curtido = true;
    }

    const buscaNorm = normalizar(String(busca || ''));
    if (buscaNorm) {
      const rx = new RegExp(escaparRegex(buscaNorm), 'i');
      query.$or = [{ nomeBusca: rx }, { nomeProduto: rx }, { marcaPeso: rx }];
    }

    const limiteNum = Math.min(Math.max(parseInt(String(limit), 10) || 30, 1), 100);
    const paginaNum = Math.max(parseInt(String(page), 10) || 1, 1);
    const skip = (paginaNum - 1) * limiteNum;

    const [docs, total] = await Promise.all([
      ScanLog.find(query)
        .select('-textoBruto -ingredientesDetalhados')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limiteNum)
        .lean(),
      ScanLog.countDocuments(query),
    ]);

    const itens = docs.map((d) => formatarItemHistorico(d, false));
    const temMais = skip + itens.length < total;

    return res.json({
      itens,
      total,
      pagina: paginaNum,
      temMais,
    });
  } catch (err) {
    console.error('Erro em GET /users/historico:', err);
    return res.status(500).json({ erro: 'Erro ao carregar histórico de escaneamentos.' });
  }
});

app.get('/users/historico/:id', autenticarJWT, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    const log = await ScanLog.findById(id).lean();
    if (!log) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    if (String(log.userId) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Acesso negado a este registro.' });
    }

    return res.json(formatarItemHistorico(log, true));
  } catch (err) {
    console.error('Erro em GET /users/historico/:id:', err);
    return res.status(500).json({ erro: 'Erro ao carregar detalhes do escaneamento.' });
  }
});

app.get('/users/historico/:id/imagem', autenticarJWT, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ erro: 'Imagem não encontrada.' });
    }

    const log = await ScanLog.findById(id).select('userId imagemArquivo').lean();
    if (!log) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    if (String(log.userId) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Acesso negado a esta imagem.' });
    }

    if (!log.imagemArquivo) {
      return res.status(404).json({ erro: 'Este escaneamento não possui miniatura salva.' });
    }

    const caminhoAbsoluto = path.resolve(UPLOADS_DIR, log.imagemArquivo);
    const baseUploadsResolvida = path.resolve(UPLOADS_DIR);
    if (!caminhoAbsoluto.startsWith(baseUploadsResolvida) || !fs.existsSync(caminhoAbsoluto)) {
      return res.status(404).json({ erro: 'Arquivo de imagem não encontrado no servidor.' });
    }

    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('Content-Type', 'image/jpeg');
    return res.sendFile(caminhoAbsoluto);
  } catch (err) {
    console.error('Erro em GET /users/historico/:id/imagem:', err);
    return res.status(500).json({ erro: 'Erro ao carregar imagem.' });
  }
});

app.patch('/users/historico/:id', autenticarJWT, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    const log = await ScanLog.findById(id);
    if (!log) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }
    if (String(log.userId) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Acesso negado a este registro.' });
    }

    const { nomeProduto, marcaPeso } = req.body || {};

    if (nomeProduto !== undefined) {
      const limpo = String(nomeProduto).trim();
      if (!limpo) {
        return res.status(400).json({ erro: 'O nome do produto não pode ficar vazio.' });
      }
      log.nomeProduto = limpo;
      log.nomeAutomatico = false;
      log.nomeBusca = normalizar(limpo);
    }

    if (marcaPeso !== undefined) {
      log.marcaPeso = marcaPeso ? String(marcaPeso).trim() : null;
    }

    await log.save();
    return res.json({
      sucesso: true,
      item: formatarItemHistorico(log, true),
    });
  } catch (err) {
    console.error('Erro em PATCH /users/historico/:id:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar informações do produto.' });
  }
});

app.patch('/users/historico/:id/curtir', autenticarJWT, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }

    const log = await ScanLog.findById(id);
    if (!log) {
      return res.status(404).json({ erro: 'Registro não encontrado.' });
    }
    if (String(log.userId) !== String(req.userId)) {
      return res.status(403).json({ erro: 'Acesso negado a este registro.' });
    }

    if (typeof req.body?.curtido === 'boolean') {
      log.curtido = req.body.curtido;
    } else {
      log.curtido = !log.curtido;
    }

    await log.save();
    return res.json({
      sucesso: true,
      curtido: log.curtido,
      item: formatarItemHistorico(log, true),
    });
  } catch (err) {
    console.error('Erro em PATCH /users/historico/:id/curtir:', err);
    return res.status(500).json({ erro: 'Erro ao atualizar favorito.' });
  }
});

// ============================================================================
// ROTA DO SCANNER OCR (JWT)
// ============================================================================

async function handlerScanner(req, res) {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhuma imagem foi enviada para análise.' });
  }

  const caminhoTemp = req.file.path;

  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado.' });
    }

    const textoExtraido = await extrairTextoDaImagem(caminhoTemp);

    const analise = await analisarTextoRotulo({
      textoBruto: textoExtraido,
      restricoes: user.restricoes,
      niveisSensibilidade: user.niveisSensibilidade,
    });

    const nomesAlergenosLog =
      analise.alergicosDetectados.length > 0
        ? analise.alergicosDetectados
            .map(
              (a) =>
                `${a.categoria.toUpperCase()} (${a.tipo}): [${(a.termos || []).join(', ')}]`
            )
            .join(' | ')
        : 'Nenhum alérgeno restrito detectado';

    console.log('\n======================================================================');
    console.log(' [ROTUSCAN OCR] NOVA ANÁLISE DE RÓTULO RECEBIDA');
    console.log('======================================================================');
    console.log(` • Usuário           : ${user.nome} (ID: ${user._id})`);
    console.log(
      ` • Restrições Ativas : ${
        user.restricoes?.length ? user.restricoes.join(', ') : 'Nenhuma'
      }`
    );
    console.log(
      ` • Sensibilidade     : Glúten=${user.niveisSensibilidade?.gluten ?? 1} | Lactose=${
        user.niveisSensibilidade?.lactose ?? 1
      } | Amendoim=${user.niveisSensibilidade?.amendoim ?? 1}`
    );
    console.log('----------------------------------------------------------------------');
    console.log(' • TEXTO BRUTO LIDO PELO TESSERACT OCR:');
    console.log(analise.textoBruto ? analise.textoBruto : '(Vazio / ilegível)');
    console.log('----------------------------------------------------------------------');
    console.log(` • Alérgenos/Sinônimos Detectados : ${nomesAlergenosLog}`);
    console.log(` • VEREDITO FINAL                 : ${analise.veredito}`);
    console.log('======================================================================\n');

    if (analise.veredito === 'INCONCLUSIVO') {
      return res.status(200).json({
        veredito: 'INCONCLUSIVO',
        status: 'INCONCLUSIVO',
        textoBruto: analise.textoBruto,
        mensagem:
          'Não consegui ler com segurança. Aproxime a câmera da lista de ingredientes com boa iluminação.',
      });
    }

    const logId = new mongoose.Types.ObjectId();
    const userIdStr = String(user._id);
    let imagemArquivoRelativo = null;

    // Salva miniatura comprimida (falha na miniatura nunca derruba a análise)
    try {
      const dirUsuario = path.join(SCANS_UPLOADS_DIR, userIdStr);
      if (!fs.existsSync(dirUsuario)) {
        await fs.promises.mkdir(dirUsuario, { recursive: true });
      }
      const nomeArquivo = `${logId}.jpg`;
      const caminhoFinalThumb = path.join(dirUsuario, nomeArquivo);

      await sharp(caminhoTemp)
        .rotate()
        .resize({ width: 480, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toFile(caminhoFinalThumb);

      imagemArquivoRelativo = path.posix.join('scans', userIdStr, nomeArquivo);
    } catch (thumbErr) {
      console.warn('Aviso: falha ao salvar miniatura do scan:', thumbErr.message);
    }

    const novoLog = await ScanLog.create({
      _id: logId,
      userId: user._id,
      nomeProduto: analise.nomeProduto,
      nomeAutomatico: true,
      nomeBusca: analise.nomeBusca,
      marcaPeso: null,
      imagemArquivo: imagemArquivoRelativo,
      imagemDemo: null,
      textoBruto: analise.textoBruto,
      veredito: analise.veredito,
      alergicosDetectados: analise.alergicosDetectados,
      ingredientesDetalhados: analise.ingredientesDetalhados,
      curtido: false,
      seed: false,
    });

    const itemFormatado = formatarItemHistorico(novoLog, true);
    return res.status(200).json({
      ...itemFormatado,
      status: analise.veredito,
      textoExtraido: analise.textoBruto,
      detalhes: analise.alergicosDetectados.map((a) => ({
        categoria: a.categoria,
        tipo: a.tipo,
        encontrados: a.termos,
      })),
    });
  } catch (err) {
    if (err?.code === 'OCR_UNAVAILABLE') {
      console.error('Erro de OCR no servidor:', err.detalhe);
      return res.status(500).json({
        erro: 'OCR indisponível no servidor',
        detalhe: err.detalhe,
        instrucoesWindows: err.instrucoesWindows,
      });
    }
    console.error('Erro no processamento do scanner:', err);
    return res.status(500).json({ erro: 'Falha ao processar a imagem do rótulo.' });
  } finally {
    try {
      if (caminhoTemp && fs.existsSync(caminhoTemp)) {
        await fs.promises.unlink(caminhoTemp);
      }
    } catch {
      // ignora erro de remoção do arquivo temporário do multer
    }
  }
}

app.post(
  '/scanner',
  autenticarJWT,
  (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ erro: 'A imagem excede o limite máximo de 8MB.' });
        }
        return res.status(400).json({ erro: err.message || 'Erro no envio da imagem.' });
      }
      return next();
    });
  },
  handlerScanner
);

app.post(
  '/api/analisar-rotulo',
  autenticarJWT,
  (req, res, next) => {
    upload.single('imagem')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ erro: err.message || 'Erro no envio da imagem.' });
      }
      return next();
    });
  },
  handlerScanner
);

// ============================================================================
// SINCRONIZAÇÃO NÃO-DESTRUTIVA DE USUÁRIOS LEGADOS NA INICIALIZAÇÃO
// ============================================================================

async function sincronizarUsuariosLegados() {
  try {
    const dbRotuScanDB = mongoose.connection.db;
    const client = mongoose.connection.getClient();

    // 1. Normaliza documentos existentes em RotuScanDB.users
    const usersAtuais = await User.find();
    for (const u of usersAtuais) {
      let mudou = false;
      const validado = validarRestricoesENiveis(
        Array.isArray(u.restricoes) ? u.restricoes : [],
        u.niveisSensibilidade,
        false
      );
      if (
        !u.niveisSensibilidade ||
        typeof u.niveisSensibilidade.gluten !== 'number' ||
        typeof u.niveisSensibilidade.lactose !== 'number' ||
        typeof u.niveisSensibilidade.amendoim !== 'number'
      ) {
        u.niveisSensibilidade = validado.niveisSensibilidade || {
          gluten: 1,
          lactose: 1,
          amendoim: 1,
        };
        mudou = true;
      }
      if (u.avatar === undefined) {
        u.avatar = null;
        mudou = true;
      }
      if (mudou) {
        await u.save();
      }
    }

    // 2. Copia de forma idempotente contas de coleções legadas `usuarios` para `RotuScanDB.users`
    const colecoesFonte = [];
    const colsMain = await dbRotuScanDB.listCollections({ name: 'usuarios' }).toArray();
    if (colsMain.length > 0) {
      colecoesFonte.push(dbRotuScanDB.collection('usuarios'));
    }

    try {
      const dbLegado = client.db('RotuScan');
      const colsLegado = await dbLegado.listCollections({ name: 'usuarios' }).toArray();
      if (colsLegado.length > 0) {
        colecoesFonte.push(dbLegado.collection('usuarios'));
      }
    } catch {
      // Ignora se não houver acesso ao banco paralelo
    }

    let migrados = 0;
    for (const col of colecoesFonte) {
      const docs = await col.find({}).toArray();
      for (const doc of docs) {
        const emailLimpo = String(doc.email || '').trim().toLowerCase();
        if (!emailLimpo || !doc.senha) continue;

        const jaExiste = await User.findOne({ email: emailLimpo }).lean();
        if (jaExiste) continue;

        let senhaFinal = String(doc.senha);
        if (!/^\$2[aby]\$/.test(senhaFinal)) {
          const salt = await bcrypt.genSalt(10);
          senhaFinal = await bcrypt.hash(senhaFinal, salt);
        }

        const validado = validarRestricoesENiveis(
          Array.isArray(doc.restricoes) ? doc.restricoes : [],
          doc.niveisSensibilidade,
          false
        );

        await User.collection.insertOne({
          nome: String(doc.nome || 'Usuário').trim(),
          email: emailLimpo,
          senha: senhaFinal,
          avatar: doc.avatar || null,
          restricoes: validado.restricoes || [],
          niveisSensibilidade: validado.niveisSensibilidade || {
            gluten: 1,
            lactose: 1,
            amendoim: 1,
          },
          createdAt: doc.createdAt || doc.dataCriacao || new Date(),
          updatedAt: new Date(),
        });
        migrados += 1;
      }
    }

    if (migrados > 0) {
      console.log(`Sincronização inicial: ${migrados} conta(s) legada(s) copiada(s) para RotuScanDB.users.`);
    }
  } catch (err) {
    console.warn('Aviso ao sincronizar usuários legados:', err.message);
  }
}

// ============================================================================
// CONEXÃO COM O MONGODB E INICIALIZAÇÃO DO SERVIDOR
// ============================================================================

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

if (!MONGO_URI) {
  console.error('ERRO: Variável MONGO_URI / MONGODB_URI não definida no arquivo .env.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI, { dbName: 'RotuScanDB' })
  .then(async () => {
    console.log('Conectado ao MongoDB Atlas (RotuScanDB) com sucesso.');
    await inicializarDicionarioPadrao();
    await sincronizarUsuariosLegados();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar ao MongoDB:', err.message);
    process.exit(1);
  });

export default app;
