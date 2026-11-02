import mongoose from 'mongoose';

export const TIPOS_FEEDBACK = ['SUGESTAO', 'PROBLEMA', 'ELOGIO', 'OUTRO'];
export const PLATAFORMAS_FEEDBACK = ['android', 'ios', 'web'];

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mensagem: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000,
    },
    tipo: {
      type: String,
      enum: TIPOS_FEEDBACK,
      default: 'OUTRO',
      required: true,
    },
    plataforma: {
      type: String,
      enum: PLATAFORMAS_FEEDBACK,
      default: 'web',
    },
    appVersao: {
      type: String,
      trim: true,
      maxlength: 30,
      default: '1.0.0',
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'feedbacks',
  }
);

const Feedback =
  mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

export default Feedback;

