import 'dotenv/config';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.join(__dirname, '..');

const PORTA_SMOKE = process.env.SMOKE_PORT || '3099';
const BASE_URL = `http://127.0.0.1:${PORTA_SMOKE}`;

const resultados = [];

function registrarResultado(etapa, passou, detalhe = '') {
  resultados.push({
    etapa,
    status: passou ? 'PASS' : 'FAIL',
    detalhe,
  });
  const icone = passou ? '[PASS]' : '[FAIL]';
  console.log(`${icone} ${etapa}${detalhe ? ` — ${detalhe}` : ''}`);
}

async function gerarImagemRotulo(linhasTexto, nomeArquivo) {
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

  const caminho = path.join(SERVER_ROOT, 'uploads', 'tmp', nomeArquivo);
  await sharp(Buffer.from(svg)).png().toFile(caminho);
  return caminho;
}

async function enviarImagemScanner(token, caminhoImagem) {
  const buffer = await fs.promises.readFile(caminhoImagem);
  const blob = new Blob([buffer], { type: 'image/png' });
  const form = new FormData();
  form.append('photo', blob, path.basename(caminhoImagem));

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

async function aguardarServidorPronto(processoServidor, timeoutMs = 20000) {
  const inicio = Date.now();
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
        reject(new Error('Timeout aguardando inicialização do servidor para smoke test.'));
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
  console.log('INICIANDO SMOKE TEST AUTOMATIZADO — ROTUSCAN API + OCR + MONGODB');
  console.log('======================================================================\n');

  const servidorProc = spawn(process.execPath, ['server.js'], {
    cwd: SERVER_ROOT,
    env: { ...process.env, PORT: String(PORTA_SMOKE) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  let tokenPrincipal = null;
  let tokenOutroUsuario = null;
  const arquivosTempCriados = [];

  try {
    await aguardarServidorPronto(servidorProc);
    registrarResultado('Inicialização do servidor Express + MongoDB + Dicionário', true, `Porta ${PORTA_SMOKE}`);

    const sufixo = Date.now();
    const emailPrincipal = `smoke_${sufixo}@rotuscan.test`;
    const emailOutro = `smoke_outro_${sufixo}@rotuscan.test`;
    const senhaPadrao = 'Teste@123';

    // 1. Cadastro com níveis de sensibilidade (lactose: 0 Leve, gluten: 2 Grave)
    const regResp = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Usuário Smoke Test',
        email: emailPrincipal,
        senha: senhaPadrao,
        restricoes: ['gluten', 'lactose'],
        niveisSensibilidade: { gluten: 2, lactose: 0, amendoim: 1 },
      }),
    });
    const regData = await regResp.json();
    tokenPrincipal = regData.token;
    registrarResultado(
      '1. POST /auth/register com restrições e níveis',
      regResp.status === 201 &&
        Boolean(tokenPrincipal) &&
        regData.usuario?.niveisSensibilidade?.lactose === 0 &&
        regData.usuario?.niveisSensibilidade?.gluten === 2,
      `HTTP ${regResp.status} | id=${regData.usuario?.id}`
    );

    // Cadastro de segundo usuário para testar isolamento (403)
    const regOutroResp = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Outro Usuário Smoke',
        email: emailOutro,
        senha: senhaPadrao,
        restricoes: ['amendoim'],
      }),
    });
    const regOutroData = await regOutroResp.json();
    tokenOutroUsuario = regOutroData.token;

    // 2. Login
    const loginResp = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailPrincipal, senha: senhaPadrao }),
    });
    const loginData = await loginResp.json();
    registrarResultado(
      '2. POST /auth/login retorna JWT e perfil público',
      loginResp.status === 200 && Boolean(loginData.token) && loginData.usuario?.email === emailPrincipal,
      `HTTP ${loginResp.status}`
    );

    // 3. GET /users/perfil
    const perfilResp = await fetch(`${BASE_URL}/users/perfil`, {
      headers: { Authorization: `Bearer ${tokenPrincipal}` },
    });
    const perfilData = await perfilResp.json();
    registrarResultado(
      '3. GET /users/perfil retorna dados + stats (America/Sao_Paulo)',
      perfilResp.status === 200 &&
        Array.isArray(perfilData.restricoes) &&
        perfilData.stats?.metaMensal === 50,
      `HTTP ${perfilResp.status} | restricoes=[${perfilData.restricoes?.join(', ')}]`
    );

    // 4. Scanner Caso A: Contém trigo (PERIGOSO / CONTEM)
    const imgTrigo = await gerarImagemRotulo(
      [
        'INGREDIENTES: Farinha de trigo enriquecida com ferro,',
        'agua, sal marinho, fermento biologico e oleo vegetal.',
        'ALERGICOS: CONTEM DERIVADOS DE TRIGO. CONTEM GLUTEN.',
      ],
      `smoke_trigo_${sufixo}.png`
    );
    arquivosTempCriados.push(imgTrigo);

    const scanTrigo = await enviarImagemScanner(tokenPrincipal, imgTrigo);
    const idScanTrigo = scanTrigo.data?.id;
    registrarResultado(
      '4. POST /scanner — Rótulo com trigo (CONTEM Glúten -> PERIGOSO)',
      scanTrigo.status === 200 &&
        scanTrigo.data.veredito === 'PERIGOSO' &&
        scanTrigo.data.nomeProduto === 'Produto com Glúten' &&
        scanTrigo.data.alergicosDetectados?.some((a) => a.categoria === 'gluten' && a.tipo === 'CONTEM'),
      `veredito=${scanTrigo.data.veredito} | nome="${scanTrigo.data.nomeProduto}"`
    );

    // 5. Scanner Caso B: Negação "não contém glúten" e "sem lactose" (SEGURO)
    const imgNegacao = await gerarImagemRotulo(
      [
        'INGREDIENTES: Farinha de arroz integral, amido de milho,',
        'agua purificada, sal marinho e oleo vegetal de girassol.',
        'INFORMACAO: NAO CONTEM GLUTEN. PRODUTO SEM LACTOSE.',
      ],
      `smoke_negacao_${sufixo}.png`
    );
    arquivosTempCriados.push(imgNegacao);

    const scanNegacao = await enviarImagemScanner(tokenPrincipal, imgNegacao);
    registrarResultado(
      '5. POST /scanner — Negação "NÃO CONTÉM GLÚTEN / SEM LACTOSE" -> SEGURO',
      scanNegacao.status === 200 && scanNegacao.data.veredito === 'SEGURO',
      `veredito=${scanNegacao.data.veredito} | nome="${scanNegacao.data.nomeProduto}"`
    );

    // 6. Scanner Caso C: "pode conter leite" com sensibilidade lactose = 0 (Leve -> ignora traços -> SEGURO)
    const imgTracosLeite = await gerarImagemRotulo(
      [
        'INGREDIENTES: Farinha de arroz, acucar demerara,',
        'cacau em po alcalino, oleo de coco e sal marinho.',
        'ALERGICOS: PODE CONTER LEITE. NAO CONTEM GLUTEN.',
      ],
      `smoke_tracos_${sufixo}.png`
    );
    arquivosTempCriados.push(imgTracosLeite);

    const scanTracosLeve = await enviarImagemScanner(tokenPrincipal, imgTracosLeite);
    registrarResultado(
      '6. POST /scanner — "PODE CONTER LEITE" com nível 0 (Leve) -> SEGURO',
      scanTracosLeve.status === 200 && scanTracosLeve.data.veredito === 'SEGURO',
      `veredito=${scanTracosLeve.data.veredito}`
    );

    // 7. PUT /users/restricoes alterando lactose para nível 1 (Moderado) e confirmando no banco
    const putRestResp = await fetch(`${BASE_URL}/users/restricoes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPrincipal}`,
      },
      body: JSON.stringify({
        restricoes: ['gluten', 'lactose'],
        niveisSensibilidade: { gluten: 2, lactose: 1, amendoim: 1 },
      }),
    });
    const putRestData = await putRestResp.json();
    registrarResultado(
      '7. PUT /users/restricoes persiste nível lactose=1 (Moderado)',
      putRestResp.status === 200 && putRestData.usuario?.niveisSensibilidade?.lactose === 1,
      `HTTP ${putRestResp.status} | lactose=${putRestData.usuario?.niveisSensibilidade?.lactose}`
    );

    // 8. Scanner Caso D: Mesma imagem "pode conter leite" agora com nível 1 (Moderado -> PERIGOSO / TRACOS)
    const scanTracosModerado = await enviarImagemScanner(tokenPrincipal, imgTracosLeite);
    registrarResultado(
      '8. POST /scanner — "PODE CONTER LEITE" com nível 1 (Moderado) -> PERIGOSO (TRACOS)',
      scanTracosModerado.status === 200 &&
        scanTracosModerado.data.veredito === 'PERIGOSO' &&
        scanTracosModerado.data.alergicosDetectados?.some(
          (a) => a.categoria === 'lactose' && a.tipo === 'TRACOS'
        ),
      `veredito=${scanTracosModerado.data.veredito} | nome="${scanTracosModerado.data.nomeProduto}"`
    );

    // 9. Scanner Caso E: Imagem com texto curto/ilegível (< 40 chars) -> INCONCLUSIVO (não salva)
    const imgIlegivel = await gerarImagemRotulo(['123 ABC'], `smoke_ilegivel_${sufixo}.png`);
    arquivosTempCriados.push(imgIlegivel);

    const scanIlegivel = await enviarImagemScanner(tokenPrincipal, imgIlegivel);
    registrarResultado(
      '9. POST /scanner — Texto curto/ilegível -> INCONCLUSIVO (sem gravar ScanLog)',
      scanIlegivel.status === 200 &&
        scanIlegivel.data.veredito === 'INCONCLUSIVO' &&
        !scanIlegivel.data.id,
      `veredito=${scanIlegivel.data.veredito}`
    );

    // 10. Histórico: filtros, paginação e busca sem acento ("gluten" encontra "Produto com Glúten")
    const histTodosResp = await fetch(`${BASE_URL}/users/historico?limit=2&page=1`, {
      headers: { Authorization: `Bearer ${tokenPrincipal}` },
    });
    const histTodos = await histTodosResp.json();

    const histBuscaResp = await fetch(`${BASE_URL}/users/historico?busca=gluten`, {
      headers: { Authorization: `Bearer ${tokenPrincipal}` },
    });
    const histBusca = await histBuscaResp.json();

    const histRiscoResp = await fetch(`${BASE_URL}/users/historico?filtro=Risco`, {
      headers: { Authorization: `Bearer ${tokenPrincipal}` },
    });
    const histRisco = await histRiscoResp.json();

    registrarResultado(
      '10. GET /users/historico — Filtros, paginação e busca "gluten" sem acento',
      histTodos.total === 4 &&
        histTodos.itens?.length === 2 &&
        histTodos.temMais === true &&
        histRisco.total === 2 &&
        histBusca.itens?.some((i) => i.nomeProduto === 'Produto com Glúten'),
      `total=${histTodos.total} | risco=${histRisco.total} | busca("gluten")=${histBusca.total}`
    );

    // 11. Curtir item e renomear produto
    const curtirResp = await fetch(`${BASE_URL}/users/historico/${idScanTrigo}/curtir`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPrincipal}`,
      },
      body: JSON.stringify({ curtido: true }),
    });
    const curtirData = await curtirResp.json();

    const renomearResp = await fetch(`${BASE_URL}/users/historico/${idScanTrigo}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenPrincipal}`,
      },
      body: JSON.stringify({ nomeProduto: 'Pão de Forma Integral', marcaPeso: 'Marca Teste • 400g' }),
    });
    const renomearData = await renomearResp.json();

    registrarResultado(
      '11. PATCH /users/historico/:id (renomear) e /:id/curtir (favoritar)',
      curtirResp.status === 200 &&
        curtirData.curtido === true &&
        renomearResp.status === 200 &&
        renomearData.item?.nomeProduto === 'Pão de Forma Integral' &&
        renomearData.item?.nomeAutomatico === false,
      `curtido=${curtirData.curtido} | nome="${renomearData.item?.nomeProduto}"`
    );

    // 12. GET /users/historico/:id/imagem (200 para o dono, 403 para outro usuário)
    const imgDonoResp = await fetch(`${BASE_URL}/users/historico/${idScanTrigo}/imagem`, {
      headers: { Authorization: `Bearer ${tokenPrincipal}` },
    });
    const imgOutroResp = await fetch(`${BASE_URL}/users/historico/${idScanTrigo}/imagem`, {
      headers: { Authorization: `Bearer ${tokenOutroUsuario}` },
    });

    registrarResultado(
      '12. GET /users/historico/:id/imagem (200 dono vs 403 outro usuário)',
      imgDonoResp.status === 200 && imgOutroResp.status === 403,
      `dono=${imgDonoResp.status} | outro=${imgOutroResp.status}`
    );

    // 13. DELETE /users/me (apaga apenas a conta de teste criada pelo próprio smoke test)
    const delPrincipalResp = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenPrincipal}` },
    });
    const delOutroResp = await fetch(`${BASE_URL}/users/me`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenOutroUsuario}` },
    });
    const perfilAposDelete = await fetch(`${BASE_URL}/users/perfil`, {
      headers: { Authorization: `Bearer ${tokenPrincipal}` },
    });

    tokenPrincipal = null;
    tokenOutroUsuario = null;

    registrarResultado(
      '13. DELETE /users/me remove conta de teste, ScanLogs e miniaturas',
      delPrincipalResp.status === 200 &&
        delOutroResp.status === 200 &&
        perfilAposDelete.status === 404,
      `DELETE=${delPrincipalResp.status} | GET após delete=${perfilAposDelete.status}`
    );
  } catch (err) {
    registrarResultado('Execução do Smoke Test', false, err.message);
    process.exitCode = 1;
  } finally {
    // Limpeza garantida caso alguma etapa tenha falhado antes do DELETE /users/me
    for (const tk of [tokenPrincipal, tokenOutroUsuario]) {
      if (tk) {
        try {
          await fetch(`${BASE_URL}/users/me`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${tk}` },
          });
        } catch {
          // ignora
        }
      }
    }

    for (const arq of arquivosTempCriados) {
      try {
        if (fs.existsSync(arq)) fs.unlinkSync(arq);
      } catch {
        // ignora
      }
    }

    servidorProc.kill();
  }

  console.log('\n======================================================================');
  console.log('RESUMO DO SMOKE TEST');
  console.log('======================================================================');
  console.table(resultados);

  const falhas = resultados.filter((r) => r.status === 'FAIL').length;
  if (falhas > 0) {
    console.error(`\nSmoke test finalizado com ${falhas} falha(s).`);
    process.exit(1);
  } else {
    console.log(`\nTodos os ${resultados.length} testes passaram com sucesso!`);
  }
}

executarSmokeTest();

