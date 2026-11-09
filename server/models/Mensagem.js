
import mongoose from 'mongoose';

const mensagemSchema = new mongoose.Schema(
  {
    pacienteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    nutricionistaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Nutricionista',
      required: true,
      index: true,
    },

    remetenteTipo: {
      type: String,
      enum: ['PACIENTE', 'NUTRICIONISTA'],
      required: true,
    },

    texto: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    lidaEm: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'mensagens',
  }
);

mensagemSchema.index({
  pacienteId: 1,
  nutricionistaId: 1,
  createdAt: -1,
});

const Mensagem =
  mongoose.models.Mensagem ||
  mongoose.model('Mensagem', mensagemSchema);

export default Mensagem;
