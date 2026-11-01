import mongoose from 'mongoose';

export const CATEGORIAS = ['gluten', 'lactose', 'amendoim'];
export const CATEGORIAS_VALIDAS = CATEGORIAS;
export const NIVEIS = [0, 1, 2]; // 0 = Leve, 1 = Moderado, 2 = Grave
export const NIVEL_PADRAO = 1;

const nivelField = {
  type: Number,
  enum: NIVEIS,
  default: NIVEL_PADRAO,
};

const userSchema = new mongoose.Schema(
  {
    nome: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // select:false -> a senha nunca sai em consultas, a não ser com .select('+senha')
    senha: { type: String, required: true, select: false },
    avatar: { type: String, default: null },
    role: {
      type: String,
      enum: ['PACIENTE', 'NUTRICIONISTA'],
      default: 'PACIENTE',
    },
    nutricionistaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    restricoes: {
      type: [{ type: String, enum: CATEGORIAS }],
      default: [],
    },
    // 0 = Leve (ignora avisos "pode conter" DAQUELE alérgeno), 1 = Moderado, 2 = Grave
    niveisSensibilidade: {
      gluten: nivelField,
      lactose: nivelField,
      amendoim: nivelField,
    },
    restricoesAtualizadasEm: { type: Date, default: null },
    restricoesAtualizadasPor: {
      type: String,
      enum: ['PACIENTE', 'NUTRICIONISTA', null],
      default: null,
    },
  },
  { timestamps: true, collection: 'users' }
);

/** Formato público do usuário (nunca inclui senha). */
userSchema.methods.toPublic = function toPublic() {
  const niveis = this.niveisSensibilidade || {};
  return {
    id: String(this._id),
    nome: this.nome,
    email: this.email,
    avatar: this.avatar || null,
    role: this.role,
    restricoes: this.restricoes || [],
    niveisSensibilidade: {
      gluten: niveis.gluten ?? NIVEL_PADRAO,
      lactose: niveis.lactose ?? NIVEL_PADRAO,
      amendoim: niveis.amendoim ?? NIVEL_PADRAO,
    },
    restricoesAtualizadasEm: this.restricoesAtualizadasEm || null,
    restricoesAtualizadasPor: this.restricoesAtualizadasPor || null,
  };
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
