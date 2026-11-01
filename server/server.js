import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import multer from 'multer';
import tesseract from 'node-tesseract-ocr';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'rotuscan_secret_key_2026';

app.use(cors());
app.use(express.json());

// Log de todas as requisições recebidas para facilitar diagnóstico no terminal
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// ==========================================
// 1. MODELOS (Schemas do Banco de Dados)
// ==========================================
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  restricoes: { type: [String], default: [] },
  liberarPodeConter: { type: Boolean, default: false }
}));

const Restricao = mongoose.model('Restricao', new mongoose.Schema({
  categoria: { type: String, required: true, unique: true }, // ex: 'lactose'
  sinonimos: [{ type: String }] 
}));

const Historico = mongoose.model('Historico', new mongoose.Schema({
  userId: { type: String, required: false },
  veredito: { type: String, enum: ['SEGURO', 'PERIGO'], required: true },
  alergicosEncontrados: [{ type: String }],
  textoLido: { type: String },
  criadoEm: { type: Date, default: Date.now }
}));


// ==========================================
// 2. CONEXÃO COM O MONGODB ATLAS E POPULAÇÃO INICIAL
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Conectado ao MongoDB Atlas com sucesso.");
    
    // 1. Remoção de índices antigos para evitar conflitos de restrição única (E11000)
    try {
      await Restricao.collection.dropIndexes();
    } catch (e) { 
      // Ignora silenciosamente se não houver índices antigos
    }

    // 2. AUTO-SEED: Verifica se precisa popular
    const count = await Restricao.countDocuments();
    
    if (count < 3) {
      console.log("Populando base de dados de restricoes...");
      await Restricao.deleteMany({});
      
      const dadosIniciais = [
        { 
          categoria: 'lactose', 
          sinonimos: [
            'leite', 'lactose', 'soro de leite', 'manteiga', 'queijo', 'caseína', 
            'creme de leite', 'nata', 'coalhada', 'iogurte', 'kefir', 'leite em pó', 
            'proteína do leite', 'lactoalbumina', 'lactoglobulina'
          ] 
        },
        { 
          categoria: 'gluten', 
          sinonimos: [
            'gluten', 'glúten', 'trigo', 'centeio', 'cevada', 'malte', 'aveia', 
            'farinha de trigo', 'espelta', 'triticale', 'kamut', 'farelo', 'germe', 
            'amido de trigo', 'proteína vegetal hidrolisada', 'farinha'
          ] 
        },
        { 
          categoria: 'amendoim', 
          sinonimos: [
            'amendoim', 'amendoins', 'óleo de amendoim', 'pasta de amendoim', 
            'manteiga de amendoim', 'paçoca', 'extrato de amendoim', 'cacauete'
          ] 
        }
      ];
      await Restricao.insertMany(dadosIniciais);
      console.log("Base de restricoes inicializada com sucesso.");
    } else {
      console.log(`Base de dados consistente: ${count} categorias registradas.`);
    }
  })
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));
  
// ==========================================
// 3. CONFIG TESSERACT
// ==========================================
const config = {
  lang: "por", oem: 1, psm: 3,
  binary: '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"' 
};


// ==========================================
// 4. ROTAS DE AUTENTICAÇÃO E PERFIL
// ==========================================

// Função auxiliar para registrar usuário (usada tanto em /auth/register quanto em /api/cadastro)
async function registrarUsuario(req, res) {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Preencha nome, e-mail e senha." });
    }

    const emailFormatado = email.trim().toLowerCase();
    const existente = await Usuario.findOne({ email: emailFormatado });
    if (existente) {
      return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novoUsuario = new Usuario({
      nome: nome.trim(),
      email: emailFormatado,
      senha: senhaHash,
      restricoes: []
    });
    await novoUsuario.save();

    const token = jwt.sign({ id: novoUsuario._id }, JWT_SECRET, { expiresIn: '30d' });
    console.log(`Usuario cadastrado com sucesso: ${novoUsuario.email}`);

    res.status(201).json({
      mensagem: "Usuário criado!",
      token,
      usuario: {
        id: String(novoUsuario._id),
        nome: novoUsuario.nome,
        email: novoUsuario.email,
        restricoes: novoUsuario.restricoes || []
      }
    });
  } catch (error) {
    console.error("Erro ao salvar usuario:", error.message);
    res.status(400).json({ erro: "Email já cadastrado ou erro nos dados enviados." });
  }
}

// Função auxiliar para autenticar usuário (usada tanto em /auth/login quanto em /api/login)
async function autenticarUsuario(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: "Informe e-mail e senha." });
    }

    const emailFormatado = email.trim().toLowerCase();
    // Busca case-insensitive ou exata para compatibilidade com cadastros antigos
    const usuario = await Usuario.findOne({
      $or: [{ email: emailFormatado }, { email: email.trim() }]
    });

    if (!usuario) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    // Suporta tanto senha com hash bcrypt quanto senha em texto puro de cadastros antigos
    let senhaValida = false;
    if (usuario.senha && usuario.senha.startsWith('$2')) {
      senhaValida = await bcrypt.compare(senha, usuario.senha);
    } else {
      senhaValida = usuario.senha === senha;
    }

    if (!senhaValida) {
      return res.status(401).json({ erro: "E-mail ou senha incorretos." });
    }

    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: '30d' });
    console.log(`Login realizado com sucesso: ${usuario.email}`);

    res.json({
      token,
      usuarioId: String(usuario._id),
      nome: usuario.nome,
      email: usuario.email,
      usuario: {
        id: String(usuario._id),
        nome: usuario.nome,
        email: usuario.email,
        restricoes: usuario.restricoes || []
      }
    });
  } catch (error) {
    console.error("Erro no login:", error.message);
    res.status(500).json({ erro: "Erro interno ao realizar login." });
  }
}

// Rotas novas usadas pelo Mobile (SDK 58)
app.post('/auth/register', registrarUsuario);
app.post('/auth/login', autenticarUsuario);

// Rotas legadas mantidas por compatibilidade
app.post('/api/cadastro', registrarUsuario);
app.post('/api/login', autenticarUsuario);

// Rota para salvar intolerâncias/restrições do usuário (selectIntolerancia.tsx)
app.put('/users/restricoes', async (req, res) => {
  try {
    const { userId, restricoes, liberarPodeConter } = req.body;
    if (!userId) {
      return res.status(400).json({ erro: "ID do usuário não informado." });
    }

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(
      userId,
      {
        restricoes: Array.isArray(restricoes) ? restricoes : [],
        liberarPodeConter: Boolean(liberarPodeConter)
      },
      { new: true }
    );

    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: "Usuário não encontrado." });
    }

    console.log(`Restricoes atualizadas para ${usuarioAtualizado.email}: [${usuarioAtualizado.restricoes.join(', ')}]`);
    res.json({
      sucesso: true,
      restricoes: usuarioAtualizado.restricoes,
      liberarPodeConter: usuarioAtualizado.liberarPodeConter
    });
  } catch (error) {
    console.error("Erro ao atualizar restricoes:", error.message);
    res.status(500).json({ erro: "Erro ao salvar restrições." });
  }
});

// Rota para buscar histórico de análises do usuário (perfil.tsx)
app.get('/users/historico/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const logs = await Historico.find({ userId }).sort({ criadoEm: -1 }).limit(50);
    res.json(logs);
  } catch (error) {
    console.error("Erro ao buscar historico:", error.message);
    res.json([]);
  }
});

// Rota para atualização de dados cadastrais e credenciais
app.put('/api/usuario/atualizar', async (req, res) => {
  const { id, nome, email, senha } = req.body;
  console.log(`Atualizacao de perfil solicitada para o ID: ${id}`);

  try {
    // Monta o objeto com os campos obrigatórios
    const dadosAtualizacao = { nome, email };

    // Se o usuário digitou uma senha nova, inclui ela no update (com hash)
    if (senha) {
      dadosAtualizacao.senha = await bcrypt.hash(senha, 10);
    }

    // Busca pelo ID do MongoDB e faz a alteração
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(id, dadosAtualizacao, { new: true });

    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: "Usuário não localizado no sistema." });
    }

    console.log("Perfil modificado com sucesso no MongoDB.");
    // Retorno conforme estrutura esperada pelo componente EditarPerfilScreen
    res.json({ sucesso: true, mensagem: "Perfil atualizado com sucesso!" });

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    res.status(500).json({ erro: "Erro interno ao tentar salvar as alterações." });
  }
});


// ==========================================
// 5. ROTA DO SCANNER (Consultando a Nuvem)
// ==========================================
const upload = multer({ dest: 'uploads/' });

app.post('/scanner', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).send('Nenhuma imagem enviada.');

  try {
    const restricoesUsuarioStr = req.body.restricoes;
    const restricoesUsuario = restricoesUsuarioStr ? JSON.parse(restricoesUsuarioStr) : [];
    const userId = req.body.userId || null;
    
    console.log(`Analise de restricoes do usuario: ${restricoesUsuario.join(', ')}`);

    const text = await tesseract.recognize(req.file.path, config);
    const textLower = text.toLowerCase().replace(/(\r\n|\n|\r)/gm, " "); 
    
    console.log("--- TEXTO LIDO DO RÓTULO ---");
    console.log(textLower);
    console.log("----------------------------");

    const restricoesDoBanco = await Restricao.find({ categoria: { $in: restricoesUsuario } });

    let alergicosEncontrados = [];

    restricoesDoBanco.forEach(restricaoDoc => {
      const categoria = restricaoDoc.categoria;
      const palavrasProibidas = restricaoDoc.sinonimos;

      palavrasProibidas.forEach(palavra => {
        if (textLower.includes(palavra)) {
          // Verificação de termos que indicam ausência do alergênico
          const falsoPos1 = `não contém ${palavra}`;
          const falsoPos2 = `sem ${palavra}`;
          const falsoPos3 = `0% ${palavra}`;

          if (!textLower.includes(falsoPos1) && !textLower.includes(falsoPos2) && !textLower.includes(falsoPos3)) {
            if (!alergicosEncontrados.includes(categoria)) {
              alergicosEncontrados.push(categoria);
            }
          }
        }
      });
    });

    const veredito = alergicosEncontrados.length > 0 ? "PERIGO" : "SEGURO";

    // Registra no histórico se houver userId
    if (userId) {
      await Historico.create({
        userId,
        veredito,
        alergicosEncontrados,
        textoLido: textLower
      }).catch(() => {});
    }

    res.json({
      sucesso: true,
      status: veredito,
      alergicosEncontrados: alergicosEncontrados
    });

  } catch (error) {
    console.error("Erro no OCR:", error);
    res.status(500).json({ erro: error.message });
  }
});

// Inicializa o Servidor
app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor rodando na porta 3000");
});
