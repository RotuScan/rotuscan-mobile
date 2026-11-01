import mongoose from 'mongoose';
import { CATEGORIAS } from './User.js';

const alergicoSchema = new mongoose.Schema(
  {
    categoria: { type: String, enum: CATEGORIAS, required: true },
    tipo: { type: String, enum: ['CONTEM', 'TRACOS'], required: true },
    // termos do dicionário que dispararam a detecção (ex.: ["trigo", "farinha de trigo"])
    termos: { type: [String], default: [] },
  },
  { _id: false }
);

const ingredienteSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true },
    risco: { type: Boolean, default: false },
    fonte: { type: String, default: null }, // ex.: "Fonte de Glúten"
  },
  { _id: false }
);

const scanLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    nomeProduto: { type: String, default: 'Produto sem nome', trim: true },
    nomeAutomatico: { type: Boolean, default: true },
    nomeBusca: { type: String, default: '' }, // minúsculo e sem acentos
    marcaPeso: { type: String, default: '', trim: true },
    // caminho relativo a server/uploads (ex.: scans/<userId>/<logId>.jpg). Nunca exposto na API.
    imagemArquivo: { type: String, default: null },
    // chave de imagem de demonstração (somente seed:true)
    imagemDemo: { type: String, default: null },
    textoBruto: { type: String, default: '' },
    veredito: { type: String, enum: ['SEGURO', 'PERIGOSO'], required: true },
    alergicosDetectados: { type: [alergicoSchema], default: [] },
    ingredientesDetalhados: { type: [ingredienteSchema], default: [] },
    curtido: { type: Boolean, default: false },
    seed: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'scanlogs' }
);

scanLogSchema.index({ userId: 1, createdAt: -1 });
scanLogSchema.index({ userId: 1, curtido: 1, createdAt: -1 });

const ScanLog = mongoose.models.ScanLog || mongoose.model('ScanLog', scanLogSchema);
export default ScanLog;

