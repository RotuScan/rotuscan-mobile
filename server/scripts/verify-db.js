import 'dotenv/config';
import mongoose from 'mongoose';
import User, { CATEGORIAS, NIVEIS, TRATAMENTOS_VALIDOS } from '../models/User.js';
import ScanLog from '../models/ScanLog.js';
import Feedback, { TIPOS_FEEDBACK, PLATAFORMAS_FEEDBACK } from '../models/Feedback.js';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('ERRO: Variável MONGO_URI / MONGODB_URI não definida no .env.');
  process.exit(1);
}

async function verificarBanco() {
  console.log('======================================================================');
  console.log('VERIFICAÇÃO DE INTEGRIDADE DO BANCO (SOMENTE LEITURA) — RotuScanDB');
  console.log('======================================================================\n');

  await mongoose.connect(MONGO_URI, { dbName: 'RotuScanDB' });

  const [users, scanlogs, feedbacks] = await Promise.all([
    User.find().select('+senha').lean(),
    ScanLog.find().lean(),
    Feedback.find().lean(),
  ]);

  const mapaUsers = new Map(users.map((u) => [String(u._id), u]));

  // 1. ScanLogs órfãos (userId inexistente em users)
  const scanlogsOrfaos = scanlogs.filter(
    (s) => !s.userId || !mapaUsers.has(String(s.userId))
  );

  // 2. Pacientes com nutricionistaId que não existe ou não tem role NUTRICIONISTA
  const vinculosInvalidos = users.filter((u) => {
    if (!u.nutricionistaId) return false;
    const nutri = mapaUsers.get(String(u.nutricionistaId));
    return !nutri || nutri.role !== 'NUTRICIONISTA';
  });

  // 3. codigoVinculo ausente ou duplicado em nutricionistas
  const nutricionistas = users.filter((u) => u.role === 'NUTRICIONISTA');
  const nutrisSemCodigo = nutricionistas.filter(
    (n) => !n.codigoVinculo || String(n.codigoVinculo).trim().length !== 8
  );

  const contagemCodigos = new Map();
  for (const u of users) {
    if (u.codigoVinculo) {
      const cod = String(u.codigoVinculo).toUpperCase();
      contagemCodigos.set(cod, (contagemCodigos.get(cod) || 0) + 1);
    }
  }
  const codigosDuplicados = Array.from(contagemCodigos.entries()).filter(
    ([, qtd]) => qtd > 1
  );

  // 4. Enums inválidos em users, scanlogs e feedbacks
  let enumsInvalidosUsers = 0;
  for (const u of users) {
    if (u.role && !['PACIENTE', 'NUTRICIONISTA'].includes(u.role)) {
      enumsInvalidosUsers++;
      continue;
    }
    if (u.tratamento && !TRATAMENTOS_VALIDOS.includes(u.tratamento)) {
      enumsInvalidosUsers++;
      continue;
    }
    if (
      Array.isArray(u.restricoes) &&
      u.restricoes.some((r) => !CATEGORIAS.includes(r))
    ) {
      enumsInvalidosUsers++;
      continue;
    }
    const nv = u.niveisSensibilidade || {};
    for (const cat of CATEGORIAS) {
      if (nv[cat] !== undefined && !NIVEIS.includes(nv[cat])) {
        enumsInvalidosUsers++;
        break;
      }
    }
  }

  let enumsInvalidosScans = 0;
  for (const s of scanlogs) {
    if (!['SEGURO', 'PERIGOSO'].includes(s.veredito)) {
      enumsInvalidosScans++;
      continue;
    }
    if (Array.isArray(s.alergicosDetectados)) {
      const invalido = s.alergicosDetectados.some(
        (a) =>
          !CATEGORIAS.includes(a.categoria) ||
          !['CONTEM', 'TRACOS'].includes(a.tipo)
      );
      if (invalido) enumsInvalidosScans++;
    }
  }

  let enumsInvalidosFeedbacks = 0;
  for (const f of feedbacks) {
    if (
      !TIPOS_FEEDBACK.includes(f.tipo) ||
      (f.plataforma && !PLATAFORMAS_FEEDBACK.includes(f.plataforma))
    ) {
      enumsInvalidosFeedbacks++;
    }
  }

  // 5. Campos obrigatórios faltando
  const usersCamposFaltando = users.filter(
    (u) => !u.nome || !u.email || !u.senha
  );
  const scansCamposFaltando = scanlogs.filter(
    (s) => !s.userId || !s.veredito || !s.nomeProduto
  );
  const feedbacksCamposFaltando = feedbacks.filter(
    (f) => !f.userId || !f.mensagem
  );

  const tabela = [
    {
      Verificacao: '1. ScanLogs órfãos (userId inexistente)',
      TotalAnalisado: scanlogs.length,
      Inconsistencias: scanlogsOrfaos.length,
      Status: scanlogsOrfaos.length === 0 ? 'OK' : 'ATENÇÃO',
    },
    {
      Verificacao: '2. Pacientes com nutricionistaId inválido',
      TotalAnalisado: users.length,
      Inconsistencias: vinculosInvalidos.length,
      Status: vinculosInvalidos.length === 0 ? 'OK' : 'ATENÇÃO',
    },
    {
      Verificacao: '3a. Nutricionistas sem codigoVinculo válido',
      TotalAnalisado: nutricionistas.length,
      Inconsistencias: nutrisSemCodigo.length,
      Status: nutrisSemCodigo.length === 0 ? 'OK' : 'ATENÇÃO',
    },
    {
      Verificacao: '3b. Códigos de vínculo duplicados',
      TotalAnalisado: contagemCodigos.size,
      Inconsistencias: codigosDuplicados.length,
      Status: codigosDuplicados.length === 0 ? 'OK' : 'ATENÇÃO',
    },
    {
      Verificacao: '4. Enums inválidos (users / scanlogs / feedbacks)',
      TotalAnalisado: users.length + scanlogs.length + feedbacks.length,
      Inconsistencias:
        enumsInvalidosUsers + enumsInvalidosScans + enumsInvalidosFeedbacks,
      Status:
        enumsInvalidosUsers + enumsInvalidosScans + enumsInvalidosFeedbacks === 0
          ? 'OK'
          : 'ATENÇÃO',
    },
    {
      Verificacao: '5. Campos obrigatórios ausentes',
      TotalAnalisado: users.length + scanlogs.length + feedbacks.length,
      Inconsistencias:
        usersCamposFaltando.length +
        scansCamposFaltando.length +
        feedbacksCamposFaltando.length,
      Status:
        usersCamposFaltando.length +
          scansCamposFaltando.length +
          feedbacksCamposFaltando.length ===
        0
          ? 'OK'
          : 'ATENÇÃO',
    },
  ];

  console.table(tabela);

  if (scanlogsOrfaos.length > 0) {
    console.log(
      '• IDs de ScanLogs órfãos:',
      scanlogsOrfaos.map((s) => String(s._id)).join(', ')
    );
  }
  if (vinculosInvalidos.length > 0) {
    console.log(
      '• IDs de usuários com nutricionistaId inválido:',
      vinculosInvalidos.map((u) => String(u._id)).join(', ')
    );
  }

  await mongoose.disconnect();
}

verificarBanco().catch(async (err) => {
  console.error('Erro ao verificar banco:', err.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

