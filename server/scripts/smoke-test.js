import 'dotenv/config';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.join(__dirname, '..');

const PORTA_SMOKE = process.env.SMOKE_PORT || '3099';
const BASE_URL = `http://127.0.0.1:${PORTA_SMOKE}`;

const resultados = [];

function registrarResultado(etapa, passou, detalhe = '', statusOverride = null) {
  const status = statusOverride || (passou ? 'PASS' : 'FAIL');
  resultados.push({
    etapa,
    status,
    detalhe,
  });
  const icone =
    status === 'PASS' ? '[PASS]' : status === 'SKIP' ? '[SKIP]' : '[FAIL]';
  console.log(`${icone} ${etapa}${detalhe ? ` — ${detalhe}` : ''}`);
}

async function gerarImagemRotulo(linhasTexto) {
  const largura = 1000;
  const altura = 420;
  const tspans = linhasTexto
    .map(
      (linha, idx) =>
        `<text x="40" y="${80 + idx * 55}" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="bold" fill="#000000">${linha}</text>`
    )
    .join('\n');

  const svg = `
    <svg width="${largura}" height="${altura}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#FFFFFF"/>
      ${tspans}
    </svg>
  `;

  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function enviarImagemScanner(token, buffer) {
  const blob = new Blob([buffer], { type: 'image/png' });
  const form = new FormData();
  form.append('photo', blob, 'rotuscan-smoke.png');

  const resp = await fetch(`${BASE_URL}/scanner`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const data = await resp.json();
  return { status: resp.status, data };
}

function cabecalhoToken(token) {
  return { Authorization: 'Bearer '.concat(token) };
}

async function aguardarServidorPronto(processoServidor, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    let resolvido = false;

    const onStdout = (chunk) => {
      const texto = chunk.toString();
      if (texto.includes('Servidor rodando na porta')) {
        resolvido = true;
        cleanup();
        resolve();
      }
    };

    const onExit = (code) => {
      if (!resolvido) {
        cleanup();
        reject(new Error(`Servidor encerrou prematuramente com código ${code}`));
      }
    };

    const timer = setTimeout(() => {
      if (!resolvido) {
        cleanup();
        reject(
          new Error('Timeout aguardando inicialização do servidor para smoke test.')
        );
      }
    }, timeoutMs);

    function cleanup() {
      clearTimeout(timer);
      processoServidor.stdout.off('data', onStdout);
      processoServidor.off('exit', onExit);
    }

    processoServidor.stdout.on('data', onStdout);
    processoServidor.on('exit', onExit);
  });
}

async function executarSmokeTest() {
  console.log('======================================================================');
  console.log('INICIANDO SMOKE TEST AUTOMATIZADO — ROTUSCAN ENTREGA 1');
  console.log('======================================================================\n');

  const servidorProc = spawn(process.execPath, ['server.js'], {
    cwd: SERVER_ROOT,
    env: {
      ...process.env,
      PORT: String(PORTA_SMOKE),
      VINCULO_RATE_LIMIT_MAX: '5',
      AUTH_RATE_LIMIT_MAX: '100',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const tokensParaLimpar = [];
  const arquivosTempCriados = [];

  try {
    await aguardarServidorPronto(servidorProc);
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('Variável MONGO_URI / MONGODB_URI não configurada.');
    }
    await mongoose.connect(mongoUri, { dbName: 'RotuScanDB' });
    registrarResultado(
      '0. Inicialização do servidor Express + MongoDB + Dicionário',
      true,
      `Porta ${PORTA_SMOKE}`
    );

    const sufixo = Date.now();
    const senhaPadrao = 'Teste@123';

    // 1. Registrar Nutricionista 1 e receber codigoVinculo
    const emailNutri1 = `nutri1_${sufixo}@rotuscan.test`;
    const regNutri1Resp = await fetch(`${BASE_URL}/auth/register-nutricionista`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Mauro Nutricionista',
        email: emailNutri1,
        senha: senhaPadrao,
        crn: 'CRN-3 12345',
        tratamento: 'Dr.',
      }),
    });
    const regNutri1Data = await regNutri1Resp.json();
    const tokenNutri1 = regNutri1Data.token;
    const codigoNutri1 = regNutri1Data.codigoVinculo;

    registrarResultado(
      '1. POST /auth/register-nutricionista cria NUTRICIONISTA e gera código de 8 chars',
      regNutri1Resp.status === 201 &&
        regNutri1Data.role === 'NUTRICIONISTA' &&
        typeof codigoNutri1 === 'string' &&
        codigoNutri1.length === 8 &&
        !/[ILO01]/.test(codigoNutri1),
      `HTTP ${regNutri1Resp.status} | codigo=${codigoNutri1} (${regNutri1Data.codigoVinculoFormatado})`
    );

    // 2. Registrar Nutricionista 2 (para testar isolamento 403)
    const emailNutri2 = `nutri2_${sufixo}@rotuscan.test`;
    const regNutri2Resp = await fetch(`${BASE_URL}/auth/register-nutricionista`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Ana Nutricionista',
        email: emailNutri2,
        senha: senhaPadrao,
        crn: 'CRN-3 99999',
        tratamento: 'Dra.',
      }),
    });
    const regNutri2Data = await regNutri2Resp.json();
    const tokenNutri2 = regNutri2Data.token;

    // 3. GET /vinculo/nutricionista/:codigo (válido com hífen/minúsculas e inexistente)
    const codigoComMascaraMinusculo = `${codigoNutri1.slice(0, 4).toLowerCase()}-${codigoNutri1.slice(4).toLowerCase()}`;
    const vincValidoResp = await fetch(
      `${BASE_URL}/vinculo/nutricionista/${codigoComMascaraMinusculo}`
    );
    const vincValidoData = await vincValidoResp.json();

    const vincInvalidoResp = await fetch(
      `${BASE_URL}/vinculo/nutricionista/ZZZZ9999`
    );
    const vincInvalidoData = await vincInvalidoResp.json();

    registrarResultado(
      '2. GET /vinculo/nutricionista/:codigo (válido e 404 inexistente)',
      vincValidoResp.status === 200 &&
        vincValidoData.nome === 'Mauro Nutricionista' &&
        vincValidoData.tratamento === 'Dr.' &&
        vincInvalidoResp.status === 404 &&
        vincInvalidoData.mensagem === 'Código não encontrado',
      `válido=${vincValidoResp.status} (${vincValidoData.tratamento} ${vincValidoData.nome}) | inexistente=${vincInvalidoResp.status}`
    );

    // 4. Registrar Paciente 1 COM código + tentando injetar role='NUTRICIONISTA' no body
    const emailPac1 = `pac1_${sufixo}@rotuscan.test`;
    const regPac1Resp = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Paciente Vinculado',
        email: emailPac1,
        senha: senhaPadrao,
        role: 'NUTRICIONISTA', // Deve ser ignorado pelo servidor!
        codigoNutricionista: codigoComMascaraMinusculo,
        restricoes: ['gluten', 'lactose'],
        niveisSensibilidade: { gluten: 2, lactose: 1, amendoim: 1 },
      }),
    });
    const regPac1Data = await regPac1Resp.json();
    const tokenPac1 = regPac1Data.token;
    const idPac1 = regPac1Data.usuario?.id;

    registrarResultado(
      '3. POST /auth/register COM código vincula paciente e ignora role malicioso no body',
      regPac1Resp.status === 201 &&
        regPac1Data.usuario?.role === 'PACIENTE' &&
        regPac1Data.nutricionista?.nome === 'Mauro Nutricionista',
      `role=${regPac1Data.usuario?.role} | nutri=${regPac1Data.nutricionista?.nome}`
    );

    // 5. Registrar Paciente 2 SEM código (fará scan ANTES de vincular para testar visibilidade temporal)
    const emailPac2 = `pac2_${sufixo}@rotuscan.test`;
    const regPac2Resp = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Paciente Sem Codigo Inicial',
        email: emailPac2,
        senha: senhaPadrao,
        restricoes: ['gluten'],
        niveisSensibilidade: { gluten: 1, lactose: 1, amendoim: 1 },
      }),
    });
    const regPac2Data = await regPac2Resp.json();
    const tokenPac2 = regPac2Data.token;
    const idPac2 = regPac2Data.usuario?.id;

    registrarResultado(
      '4. POST /auth/register SEM código cria paciente sem vínculo',
      regPac2Resp.status === 201 && regPac2Data.nutricionista === null,
      `HTTP ${regPac2Resp.status} | id=${idPac2}`
    );

    // 6. Gerar imagem e realizar Scan no Paciente 1 (vinculado) e Scan ANTERIOR ao vínculo no Paciente 2
    const imgTrigo = await gerarImagemRotulo(
      [
        'INGREDIENTES: Farinha de trigo enriquecida com ferro,',
        'agua, sal marinho, fermento biologico e oleo vegetal.',
        'ALERGICOS: CONTEM DERIVADOS DE TRIGO. CONTEM GLUTEN.',
      ]
    );

    const scanPac1 = await enviarImagemScanner(tokenPac1, imgTrigo);
    const idScanPac1 = scanPac1.data?.id;

    const scanPac2AntesVinculo = await enviarImagemScanner(tokenPac2, imgTrigo);
    const idScanPac2Antigo = scanPac2AntesVinculo.data?.id;

    // Aguarda 50ms e vincula Paciente 2 ao Nutricionista 1 DEPOIS do primeiro scan
    await new Promise((r) => setTimeout(r, 60));
    const vincPac2Resp = await fetch(`${BASE_URL}/users/vinculo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPac2}`,
      },
      body: JSON.stringify({ codigo: codigoNutri1 }),
    });

    // Agora Paciente 2 faz um segundo scan APÓS o vínculo
    await new Promise((r) => setTimeout(r, 60));
    const scanPac2DepoisVinculo = await enviarImagemScanner(tokenPac2, imgTrigo);
    const idScanPac2Novo = scanPac2DepoisVinculo.data?.id;

    registrarResultado(
      '5. POST /scanner grava ScanLog e POST /users/vinculo vincula Paciente 2',
      scanPac1.status === 200 &&
        Boolean(idScanPac1) &&
        vincPac2Resp.status === 200 &&
        Boolean(idScanPac2Antigo) &&
        Boolean(idScanPac2Novo),
      `scanPac1=${idScanPac1} | scanAntigo=${idScanPac2Antigo} | scanNovo=${idScanPac2Novo}`
    );

    const scanlogsCollection = mongoose.connection.db.collection('scanlogs');
    const scanSalvo = await scanlogsCollection.findOne(
      { _id: new mongoose.Types.ObjectId(idScanPac1) },
      {
        projection: {
          userId: 1,
          escaneadoPorNome: 1,
          nomeProduto: 1,
          marca: 1,
          peso: 1,
          veredito: 1,
          createdAt: 1,
          imagemThumb: 1,
        },
      }
    );
    const historicoPac1Resp = await fetch(
      `${BASE_URL}/users/historico?limit=100`,
      { headers: cabecalhoToken(tokenPac1) }
    );
    const historicoPac1 = await historicoPac1Resp.json();
    const itemHistoricoScan = (historicoPac1.itens || []).find(
      (item) => item.id === idScanPac1
    );
    const imagemScanResp = await fetch(
      `${BASE_URL}/users/historico/${idScanPac1}/imagem`,
      { headers: cabecalhoToken(tokenPac1) }
    );
    const imagemScanBytes = await imagemScanResp.arrayBuffer();
    const thumbValida =
      typeof scanSalvo?.imagemThumb === 'string' &&
      scanSalvo.imagemThumb.startsWith('data:image/jpeg;base64,') &&
      Buffer.byteLength(scanSalvo.imagemThumb, 'utf8') <= 30 * 1024;
    const documentoResumido = scanSalvo
      ? {
          _id: String(scanSalvo._id),
          userId: String(scanSalvo.userId),
          escaneadoPorNome: scanSalvo.escaneadoPorNome,
          nomeProduto: scanSalvo.nomeProduto,
          marca: scanSalvo.marca,
          peso: scanSalvo.peso,
          veredito: scanSalvo.veredito,
          createdAt: scanSalvo.createdAt,
          imagemThumbPresente: thumbValida,
        }
      : null;
    const itemHistoricoResumido = itemHistoricoScan
      ? {
          id: itemHistoricoScan.id,
          userId: itemHistoricoScan.userId,
          nomeProduto: itemHistoricoScan.nomeProduto,
          marca: itemHistoricoScan.marca,
          peso: itemHistoricoScan.peso,
          veredito: itemHistoricoScan.veredito,
          imagemThumbNaResposta: itemHistoricoScan.imagemThumb !== undefined,
        }
      : null;

    registrarResultado(
      '5a. ScanLog em scanlogs, ObjectId, escaneadoPorNome, imagemThumb e GET Histórico/imagem',
      scanSalvo?.userId?._bsontype === 'ObjectId' &&
        scanSalvo.escaneadoPorNome === 'Paciente Vinculado' &&
        thumbValida &&
        Boolean(itemHistoricoScan) &&
        itemHistoricoScan.imagemThumb === undefined &&
        historicoPac1Resp.status === 200 &&
        imagemScanResp.status === 200 &&
        imagemScanResp.headers.get('content-type')?.includes('image/jpeg') &&
        imagemScanBytes.byteLength > 0,
      `documento=${JSON.stringify(documentoResumido)} | GET histórico ${historicoPac1Resp.status}=${JSON.stringify(itemHistoricoResumido)} | imagem=${imagemScanResp.status} (${imagemScanBytes.byteLength} bytes)`
    );

    // 7. PATCH /users/historico/:id — válido (nome, marca, peso), vazio, id inválido (400), log de outro usuário (403)
    const patchValidoResp = await fetch(
      `${BASE_URL}/users/historico/${idScanPac1}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenPac1}`,
        },
        body: JSON.stringify({
          nomeProduto: 'Biscoito Água e Sal',
          marca: 'Marca Crocante',
          peso: '200g',
        }),
      }
    );
    const patchValidoData = await patchValidoResp.json();

    const patchVazioResp = await fetch(
      `${BASE_URL}/users/historico/${idScanPac1}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenPac1}`,
        },
        body: JSON.stringify({ nomeProduto: '   ' }),
      }
    );

    const patchIdInvalidoResp = await fetch(
      `${BASE_URL}/users/historico/id-invalido-123`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenPac1}`,
        },
        body: JSON.stringify({ nomeProduto: 'Teste' }),
      }
    );
    const patchIdInvalidoData = await patchIdInvalidoResp.json();

    const patchOutroUserResp = await fetch(
      `${BASE_URL}/users/historico/${idScanPac1}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenPac2}`,
        },
        body: JSON.stringify({ nomeProduto: 'Tentativa Invasao' }),
      }
    );

    registrarResultado(
      '6. PATCH /users/historico/:id (válido 200, nome vazio 400, id inválido 400, outro usuário 403)',
      patchValidoResp.status === 200 &&
        patchValidoData.nomeProduto === 'Biscoito Água e Sal' &&
        patchValidoData.marca === 'Marca Crocante' &&
        patchValidoData.peso === '200g' &&
        patchValidoData.marcaPeso === 'Marca Crocante • 200g' &&
        patchValidoData.nomeAutomatico === false &&
        patchVazioResp.status === 400 &&
        patchIdInvalidoResp.status === 400 &&
        patchIdInvalidoData.mensagem === 'Identificador inválido' &&
        patchOutroUserResp.status === 403,
      `200="${patchValidoData.marcaPeso}" | vazio=${patchVazioResp.status} | idInv=${patchIdInvalidoResp.status} | outro=${patchOutroUserResp.status}`
    );

    const updateDireto = await scanlogsCollection.updateOne(
      { _id: new mongoose.Types.ObjectId(idScanPac1) },
      {
        $set: {
          nomeProduto: 'Café [Teste].',
          marca: 'Árvore Natural',
          peso: '250g',
          nomeBusca: 'cache desatualizado',
        },
      }
    );
    const scanEditadoResp = await fetch(
      `${BASE_URL}/users/historico/${idScanPac1}`,
      { headers: cabecalhoToken(tokenPac1) }
    );
    const scanEditado = await scanEditadoResp.json();
    const buscaNomeResp = await fetch(
      `${BASE_URL}/users/historico?busca=${encodeURIComponent('CAFE [Teste].')}`,
      { headers: cabecalhoToken(tokenPac1) }
    );
    const buscaNome = await buscaNomeResp.json();
    const buscaMarcaResp = await fetch(
      `${BASE_URL}/users/historico?busca=${encodeURIComponent('ARVORE')}`,
      { headers: cabecalhoToken(tokenPac1) }
    );
    const buscaMarca = await buscaMarcaResp.json();

    registrarResultado(
      '6a. updateOne no Atlas reflete nome/marca/peso e busca ignora nomeBusca obsoleto',
      updateDireto.modifiedCount === 1 &&
        scanEditadoResp.status === 200 &&
        scanEditado.nomeProduto === 'Café [Teste].' &&
        scanEditado.marca === 'Árvore Natural' &&
        scanEditado.peso === '250g' &&
        scanEditado.marcaPeso === 'Árvore Natural • 250g' &&
        buscaNomeResp.status === 200 &&
        buscaNome.itens?.some((item) => item.id === idScanPac1) &&
        buscaMarcaResp.status === 200 &&
        buscaMarca.itens?.some((item) => item.id === idScanPac1),
      `updateOne=${updateDireto.modifiedCount} | detalhe=${scanEditadoResp.status} | buscaNome=${buscaNomeResp.status} | buscaMarca=${buscaMarcaResp.status}`
    );

    const totalScansAntesInconclusivo = await scanlogsCollection.countDocuments({
      userId: new mongoose.Types.ObjectId(idPac1),
    });
    const imgInconclusiva = await gerarImagemRotulo(['TESTE']);
    const scanInconclusivo = await enviarImagemScanner(
      tokenPac1,
      imgInconclusiva
    );
    const totalScansDepoisInconclusivo =
      await scanlogsCollection.countDocuments({
        userId: new mongoose.Types.ObjectId(idPac1),
      });

    registrarResultado(
      '6b. INCONCLUSIVO retorna sem gravar ScanLog',
      scanInconclusivo.status === 200 &&
        (scanInconclusivo.data.veredito === 'INCONCLUSIVO' ||
          scanInconclusivo.data.status === 'INCONCLUSIVO') &&
        totalScansAntesInconclusivo === totalScansDepoisInconclusivo,
      `1 tentativa | HTTP ${scanInconclusivo.status} | veredito=${scanInconclusivo.data.veredito || scanInconclusivo.data.status} | scans=${totalScansAntesInconclusivo}->${totalScansDepoisInconclusivo}`
    );

    // 8. POST e GET /feedback — válido (201, ignora extras), curto (400), limite 5/h (429) e GET { id, mensagem, createdAt }
    const fbVazioResp = await fetch(`${BASE_URL}/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPac1}`,
      },
      body: JSON.stringify({ mensagem: 'Oi', tipo: 'SUGESTAO' }), // < 3 chars
    });

    const statusFeedbacks = [];
    for (let i = 1; i <= 6; i++) {
      const r = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenPac1}`,
        },
        body: JSON.stringify({
          mensagem: `Feedback de teste número ${i} enviado pelo smoke test.`,
          tipo: 'SUGESTAO',
          plataforma: 'android',
          appVersao: '1.0.0',
          campoIgnorado: 'teste',
        }),
      });
      statusFeedbacks.push(r.status);
    }

    const getFbResp = await fetch(`${BASE_URL}/feedback`, {
      headers: { Authorization: `Bearer ${tokenPac1}` },
    });
    const getFbData = await getFbResp.json();
    const itensFb = Array.isArray(getFbData?.itens) ? getFbData.itens : [];
    const getFbEstruturaOk =
      getFbResp.status === 200 &&
      itensFb.length === 5 &&
      itensFb.every(
        (f) =>
          Boolean(f.id) &&
          typeof f.mensagem === 'string' &&
          Boolean(f.createdAt) &&
          f.tipo === undefined &&
          f.plataforma === undefined &&
          f.appVersao === undefined
      );

    registrarResultado(
      '7. POST /feedback e GET /feedback (vazio 400, 5 envios 201 com extras ignorados, 6º bloqueado com 429 e GET {id, mensagem, createdAt})',
      fbVazioResp.status === 400 &&
        statusFeedbacks.slice(0, 5).every((s) => s === 201) &&
        statusFeedbacks[5] === 429 &&
        getFbEstruturaOk,
      `curto=${fbVazioResp.status} | sequência=[${statusFeedbacks.join(', ')}] | get200=${getFbResp.status} | total=${itensFb.length} | semCamposLegados=${getFbEstruturaOk}`
    );

    // 9. Nutricionista 1 lista pacientes, vê histórico e imagem do paciente vinculado, e NÃO vê scan anterior ao vínculo
    const listaPacResp = await fetch(`${BASE_URL}/nutri/pacientes`, {
      headers: { Authorization: `Bearer ${tokenNutri1}` },
    });
    const listaPacData = await listaPacResp.json();

    const histPac2NutriResp = await fetch(
      `${BASE_URL}/nutri/pacientes/${idPac2}/historico`,
      {
        headers: { Authorization: `Bearer ${tokenNutri1}` },
      }
    );
    const histPac2NutriData = await histPac2NutriResp.json();

    const imgScanNovoNutriResp = await fetch(
      `${BASE_URL}/nutri/pacientes/${idPac2}/historico/${idScanPac2Novo}/imagem`,
      {
        headers: { Authorization: `Bearer ${tokenNutri1}` },
      }
    );

    const imgScanAntigoNutriResp = await fetch(
      `${BASE_URL}/nutri/pacientes/${idPac2}/historico/${idScanPac2Antigo}/imagem`,
      {
        headers: { Authorization: `Bearer ${tokenNutri1}` },
      }
    );

    const idsHistoricoVisivelPac2 = (histPac2NutriData.itens || []).map(
      (i) => i.id
    );

    registrarResultado(
      '8. Nutricionista lista pacientes, vê scan/imagem pós-vínculo e NÃO vê scan pré-vínculo',
      listaPacResp.status === 200 &&
        listaPacData.total === 2 &&
        idsHistoricoVisivelPac2.includes(idScanPac2Novo) &&
        !idsHistoricoVisivelPac2.includes(idScanPac2Antigo) &&
        imgScanNovoNutriResp.status === 200 &&
        imgScanAntigoNutriResp.status === 403,
      `pacientes=${listaPacData.total} | visíveisPac2=${idsHistoricoVisivelPac2.length} | imgNova=${imgScanNovoNutriResp.status} | imgAntiga=${imgScanAntigoNutriResp.status}`
    );

    // 10. Outro nutricionista (Nutricionista 2) recebe 403 ao tentar acessar Paciente 1
    const outroNutriResp = await fetch(
      `${BASE_URL}/nutri/pacientes/${idPac1}/historico`,
      {
        headers: { Authorization: `Bearer ${tokenNutri2}` },
      }
    );

    registrarResultado(
      '9. Outro nutricionista não vinculado recebe 403 ao acessar paciente',
      outroNutriResp.status === 403,
      `HTTP ${outroNutriResp.status}`
    );

    // 11. PUT /nutri/pacientes/:id/restricoes atualiza perfil do paciente com restricoesAtualizadasPor='NUTRICIONISTA'
    const putNutriRestResp = await fetch(
      `${BASE_URL}/nutri/pacientes/${idPac1}/restricoes`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tokenNutri1}`,
        },
        body: JSON.stringify({
          restricoes: ['gluten', 'lactose', 'amendoim'],
          niveisSensibilidade: { gluten: 2, lactose: 2, amendoim: 2 },
        }),
      }
    );

    const perfilPac1AposNutriResp = await fetch(`${BASE_URL}/users/perfil`, {
      headers: { Authorization: `Bearer ${tokenPac1}` },
    });
    const perfilPac1AposNutri = await perfilPac1AposNutriResp.json();

    registrarResultado(
      '10. PUT /nutri/pacientes/:id/restricoes reflete em GET /users/perfil do paciente',
      putNutriRestResp.status === 200 &&
        perfilPac1AposNutri.restricoes?.length === 3 &&
        perfilPac1AposNutri.restricoesAtualizadasPor === 'NUTRICIONISTA' &&
        Boolean(perfilPac1AposNutri.restricoesAtualizadasEm),
      `por=${perfilPac1AposNutri.restricoesAtualizadasPor} | restricoes=[${perfilPac1AposNutri.restricoes?.join(', ')}]`
    );

    // 12. Paciente 2 desvincula (DELETE /users/vinculo) e Nutricionista 1 perde o acesso (403)
    const delVincPac2Resp = await fetch(`${BASE_URL}/users/vinculo`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenPac2}` },
    });

    const nutriTentaPac2AposDesvinculo = await fetch(
      `${BASE_URL}/nutri/pacientes/${idPac2}`,
      {
        headers: { Authorization: `Bearer ${tokenNutri1}` },
      }
    );

    registrarResultado(
      '11. DELETE /users/vinculo desvincula paciente e nutricionista perde acesso (403)',
      delVincPac2Resp.status === 200 &&
        nutriTentaPac2AposDesvinculo.status === 403,
      `desvinculo=${delVincPac2Resp.status} | acessoNutriApos=${nutriTentaPac2AposDesvinculo.status}`
    );

    // 12. Persistência de intolerâncias: validação de lista vazia (400), troca glúten->amendoim com níveis,
    // persistência no banco (GET /users/perfil) e reflexo no scanner (trigo=SEGURO, amendoim=PERIGOSO)
    const putVazioResp = await fetch(`${BASE_URL}/users/restricoes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPac2}`,
      },
      body: JSON.stringify({
        restricoes: [],
      }),
    });
    const putVazioData = await putVazioResp.json();

    const putTrocaResp = await fetch(`${BASE_URL}/users/restricoes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPac2}`,
      },
      body: JSON.stringify({
        restricoes: ['amendoim'],
        niveisSensibilidade: { gluten: 0, lactose: 0, amendoim: 2 },
      }),
    });
    const putTrocaData = await putTrocaResp.json();

    const perfilPac2AposTrocaResp = await fetch(`${BASE_URL}/users/perfil`, {
      headers: { Authorization: `Bearer ${tokenPac2}` },
    });
    const perfilPac2AposTroca = await perfilPac2AposTrocaResp.json();

    const imgAmendoim = await gerarImagemRotulo(
      [
        'INGREDIENTES: Amendoim torrado e moido, sal refinado.',
        'ALERGICOS: CONTEM AMENDOIM.',
      ],
      `smoke_amendoim_${sufixo}.png`
    );

    // Scan de trigo com glúten DESLIGADO -> deve ser SEGURO
    const scanTrigoSemGluten = await enviarImagemScanner(tokenPac2, imgTrigo);
    const glutenAlertado = (scanTrigoSemGluten.data.detalhes || []).some(
      (d) => d.categoria === 'gluten'
    );

    // Scan de amendoim com amendoim ATIVO -> deve ser PERIGOSO
    const scanAmendoimAtivo = await enviarImagemScanner(tokenPac2, imgAmendoim);
    const amendoimAlertado = (scanAmendoimAtivo.data.detalhes || []).some(
      (d) => d.categoria === 'amendoim'
    );

    registrarResultado(
      '12. PUT /users/restricoes (esvaziar 400 em pt-BR, troca glúten->amendoim reflete em GET /perfil e no Scanner)',
      putVazioResp.status === 400 &&
        putVazioData.mensagem?.includes('Selecione ao menos uma intolerância') &&
        putTrocaResp.status === 200 &&
        perfilPac2AposTroca.restricoes?.length === 1 &&
        perfilPac2AposTroca.restricoes[0] === 'amendoim' &&
        perfilPac2AposTroca.niveisSensibilidade?.amendoim === 2 &&
        perfilPac2AposTroca.restricoesAtualizadasPor === 'PACIENTE' &&
        scanTrigoSemGluten.status === 200 &&
        scanTrigoSemGluten.data.status === 'SEGURO' &&
        !glutenAlertado &&
        scanAmendoimAtivo.status === 200 &&
        scanAmendoimAtivo.data.status === 'PERIGOSO' &&
        amendoimAlertado,
      `vazio400="${putVazioData.mensagem}" | restricoes=[${perfilPac2AposTroca.restricoes?.join(', ')}] | trigoStatus=${scanTrigoSemGluten.data.status} | amendoimStatus=${scanAmendoimAtivo.data.status}`
    );

    // 13. Rate limit em GET /vinculo/nutricionista/:codigo (configurado em 5 no env do smoke)
    const statusRateLimit = [];
    for (let i = 0; i < 6; i++) {
      const r = await fetch(`${BASE_URL}/vinculo/nutricionista/${codigoNutri1}`);
      statusRateLimit.push(r.status);
    }

    registrarResultado(
      '13. Rate Limit (express-rate-limit) bloqueia excesso de tentativas com HTTP 429',
      statusRateLimit.includes(429),
      `statuses=[${statusRateLimit.join(', ')}]`
    );

    if (false) {
    // O teste destrutivo de exclusão de contas é mantido inativo para preservar dados.
    // 14. DELETE /users/me de nutricionista NÃO apaga Paciente 1 (apenas limpa nutricionistaId dele)
    const delNutri1Resp = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenNutri1}` },
    });

    const perfilPac1AposDelNutriResp = await fetch(`${BASE_URL}/users/perfil`, {
      headers: { Authorization: `Bearer ${tokenPac1}` },
    });
    const perfilPac1AposDelNutri = await perfilPac1AposDelNutriResp.json();

    // Agora limpa Paciente 1, Paciente 2 e Nutricionista 2
    const delPac1Resp = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenPac1}` },
    });
    const delPac2Resp = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenPac2}` },
    });
    const delNutri2Resp = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenNutri2}` },
    });

    tokensParaLimpar.length = 0;

    registrarResultado(
      '14. DELETE /users/me (nutricionista preserva pacientes; paciente apaga conta, logs, feedbacks e imagens)',
      delNutri1Resp.status === 200 &&
        perfilPac1AposDelNutriResp.status === 200 &&
        perfilPac1AposDelNutri.nutricionista === null &&
        delPac1Resp.status === 200 &&
        delPac2Resp.status === 200 &&
        delNutri2Resp.status === 200,
      `delNutri=${delNutri1Resp.status} | pac1ContinuaVivo=${perfilPac1AposDelNutriResp.status} (nutri=${perfilPac1AposDelNutri.nutricionista}) | delPac1=${delPac1Resp.status}`
    );
    }

    registrarResultado(
      '14. DELETE /users/me (não executado para preservar a base de teste)',
      true,
      'SKIP — Smoke não exclui contas, scans, coleções ou arquivos.',
      'SKIP'
    );
  } catch (err) {
    registrarResultado('Execução do Smoke Test', false, err.message);
    process.exitCode = 1;
  } finally {
    for (const tk of tokensParaLimpar) {
      if (tk) {
        try {
          await fetch(`${BASE_URL}/users/me`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tk}` },
          });
        } catch {}
      }
    }

    for (const arq of arquivosTempCriados) {
      try {
        if (fs.existsSync(arq)) fs.unlinkSync(arq);
      } catch {}
    }

    await mongoose.disconnect().catch(() => {});
    servidorProc.kill();
  }

  console.log('\n======================================================================');
  console.log('RESUMO DO SMOKE TEST (ENTREGA 1)');
  console.log('======================================================================');
  console.table(resultados);

  const falhas = resultados.filter((r) => r.status === 'FAIL').length;
  const pulados = resultados.filter((r) => r.status === 'SKIP').length;
  if (falhas > 0) {
    console.error(`\nSmoke test finalizado com ${falhas} falha(s).`);
    process.exit(1);
  } else {
    console.log(
      `\nSmoke concluído: ${resultados.length - pulados} aprovados, ${pulados} pulado(s) para evitar exclusões.`
    );
  }
}

executarSmokeTest();
