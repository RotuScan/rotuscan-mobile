import { SerialPort } from 'serialport';

let portaSerial = null;
let caminhoConectado = null;
let ultimoEnvio = null;
let erroConexao = null;

export async function listarPortasArduino() {
  const portas = await SerialPort.list();
  return portas.map((p) => ({
    path: p.path,
    manufacturer: p.manufacturer || null,
    vendorId: p.vendorId || null,
    productId: p.productId || null,
  }));
}

export async function conectarArduino(caminho) {
  if (!caminho || typeof caminho !== 'string') {
    throw new Error('Informe a porta serial do Arduino (ex.: COM3 ou /dev/ttyACM0).');
  }

  if (portaSerial?.isOpen && caminhoConectado === caminho) {
    return { conectado: true, porta: caminho };
  }

  await desconectarArduino();
  const novaPorta = new SerialPort({ path: caminho, baudRate: 9600, autoOpen: false });

  await new Promise((resolve, reject) => {
    novaPorta.open((err) => (err ? reject(err) : resolve()));
  });
  // Muitas placas Uno reiniciam automaticamente quando a porta serial abre.
  await new Promise((resolve) => setTimeout(resolve, 2000));

  novaPorta.on('error', (err) => {
    erroConexao = err.message;
    console.error('[Arduino] Erro na porta serial:', err.message);
  });
  novaPorta.on('close', () => {
    if (portaSerial === novaPorta) {
      portaSerial = null;
      caminhoConectado = null;
    }
  });

  portaSerial = novaPorta;
  caminhoConectado = caminho;
  erroConexao = null;
  console.log(`[Arduino] Conectado em ${caminho} a 9600 baud.`);
  return { conectado: true, porta: caminho };
}

export async function desconectarArduino() {
  if (!portaSerial) return;
  const atual = portaSerial;
  portaSerial = null;
  caminhoConectado = null;
  if (atual.isOpen) {
    await new Promise((resolve) => atual.close(() => resolve()));
  }
}

export async function enviarVereditoArduino(veredito) {
  const comandos = {
    SEGURO: 'SEGURO',
    PERIGOSO: 'PERIGOSO',
    INCONCLUSIVO: 'INCONCLUSIVO',
  };
  const comando = comandos[veredito];
  if (!comando) throw new Error('Veredito inválido para a estação Arduino.');
  if (!portaSerial?.isOpen) {
    throw new Error('Arduino não conectado. Verifique o cabo USB e configure ARDUINO_PORT no arquivo .env do servidor.');
  }

  await new Promise((resolve, reject) => {
    portaSerial.write(`${comando}\n`, (err) => {
      if (err) return reject(err);
      portaSerial.drain((drainErr) => (drainErr ? reject(drainErr) : resolve()));
    });
  });

  ultimoEnvio = { veredito, comando, enviadoEm: new Date().toISOString() };
  return ultimoEnvio;
}

export function statusArduino() {
  return {
    conectado: Boolean(portaSerial?.isOpen),
    porta: caminhoConectado,
    baudRate: 9600,
    ultimoEnvio,
    erro: erroConexao,
  };
}

export async function conectarArduinoConfigurado() {
  const caminho = process.env.ARDUINO_PORT;
  if (!caminho) {
    console.log('[Arduino] ARDUINO_PORT não configurada. A estação poderá ser conectada pela configuração do servidor.');
    return;
  }
  try {
    await conectarArduino(caminho);
  } catch (err) {
    erroConexao = err.message;
    console.warn(`[Arduino] Não foi possível conectar em ${caminho}: ${err.message}`);
  }
}
