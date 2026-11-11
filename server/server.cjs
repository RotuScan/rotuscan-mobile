require('dotenv').config();
const mongoose = require('mongoose');
const { SerialPort, ReadlineParser } = require('serialport');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB conectado.'))
  .catch(err => console.error('Erro na conexão:', err));

const RotuloModel = mongoose.model('Rotulo', new mongoose.Schema({ produto: String, ingredientes: String }), 'rotulos');
const RestricaoModel = mongoose.model('Restricao', new mongoose.Schema({ nome: String, chaves: [String] }), 'restricoes');

const port = new SerialPort({
  path: process.env.SERIAL_PORT || 'COM4',
  baudRate: 9600
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\r\n' }));

let indiceRotulo = 0;
let indiceRestricao = 0;

parser.on('data', async (data) => {
  const comando = data.trim();
  console.log(`Comando: ${comando}`);

  try {
    const restricoes = await RestricaoModel.find({});
    const rotulos = await RotuloModel.find({});

    if (!restricoes.length || !rotulos.length) return;

    if (comando === 'BTN_PERFIL_PRESS') {
      indiceRestricao = (indiceRestricao + 1) % restricoes.length;
      const r = restricoes[indiceRestricao];
      port.write(`PERFIL|${r.nome}|${r.chaves.join(',')}\n`);
      console.log(`-> Perfil: ${r.nome}`);
    }

    if (comando === 'BTN_SCAN_PRESS') {
      const rotulo = rotulos[indiceRotulo];
      const restricao = restricoes[indiceRestricao];
      indiceRotulo = (indiceRotulo + 1) % rotulos.length;

      const chavesStr = restricao.chaves.filter(Boolean).join(',');
      port.write(`${rotulo.produto}|${rotulo.ingredientes}|${restricao.nome}|${chavesStr}\n`);
      console.log(`-> Produto: ${rotulo.produto}`);
    }
  } catch (err) {
    console.error('Erro:', err);
  }
});

port.on('open', () => console.log('Porta serial aberta.'));