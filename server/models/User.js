import mongoose from 'mongoose';

export const CATEGORIAS = ['gluten', 'lactose', 'amendoim'];
export const CATEGORIAS_VALIDAS = CATEGORIAS;
export const NIVEIS = [0, 1, 2]; export const NIVEL_PADRAO = 1;
export const TRATAMENTOS_VALIDOS = ['Dr.', 'Dra.', 'Nutri.'];

export function formatarCodigoVinculo(codigo) {
  if (!codigo || typeof codigo !== 'string') return null;
  const limpo = codigo.replace(/[\s-]+/g, '').toUpperCase();
  if (limpo.length !== 8) return limpo;
  return `${limpo.slice(0, 4)}-${limpo.slice(4, 8)}`;
}

const nivelField = {
  type: Number,
  enum: NIVEIS,
  default: NIVEL_PADRAO,
};

const userSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 160,
    },
    // select:false -> a senha nunca sai em consultas, a não ser com .select('+senha')
    senha: {
      type: String,
      required: true,
      select: false,
    },
    avatar: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['PACIENTE', 'NUTRICIONISTA'],
      default: 'PACIENTE',
      required: true,
    },
    // Campos exclusivos de NUTRICIONISTA
    crn: {
      type: String,
      trim: true,
      maxlength: 30,
      default: null,
    },
    tratamento: {
      type: String,
      enum: [...TRATAMENTOS_VALIDOS, null],
      default: null,
    },
    codigoVinculo: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 16,
    },
    // Campos de vínculo do PACIENTE com um NUTRICIONISTA
    nutricionistaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    vinculadoEm: {
      type: Date,
      default: null,
    },
    consentimentoVinculoEm: {
      type: Date,
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
    restricoesAtualizadasEm: {
      type: Date,
      default: null,
    },
    restricoesAtualizadasPor: {
      type: String,
      enum: ['PACIENTE', 'NUTRICIONISTA', null],
      default: null,
    },
  },
  {
    timestamps: true,
    strict: true,
    collection: 'users',
  }
);

userSchema.index({ codigoVinculo: 1 }, { unique: true, sparse: true });

/** Formato público do usuário (nunca inclui senha). */
userSchema.methods.toPublic = function toPublic() {
  const niveis = this.niveisSensibilidade || {};
  const pub = {
    id: String(this._id),
    nome: this.nome,
    email: this.email,
    avatar: this.avatar || null,
    role: this.role || 'PACIENTE',
    restricoes: this.restricoes || [],
    niveisSensibilidade: {
      gluten: niveis.gluten ?? NIVEL_PADRAO,
      lactose: niveis.lactose ?? NIVEL_PADRAO,
      amendoim: niveis.amendoim ?? NIVEL_PADRAO,
    },
    nutricionistaId: this.nutricionistaId ? String(this.nutricionistaId) : null,
    vinculadoEm: this.vinculadoEm || null,
    consentimentoVinculoEm: this.consentimentoVinculoEm || null,
    restricoesAtualizadasEm: this.restricoesAtualizadasEm || null,
    restricoesAtualizadasPor: this.restricoesAtualizadasPor || null,
  };

  if (this.role === 'NUTRICIONISTA') {
    pub.crn = this.crn || null;
    pub.tratamento = this.tratamento || null;
    pub.codigoVinculo = this.codigoVinculo || null;
    pub.codigoVinculoFormatado = formatarCodigoVinculo(this.codigoVinculo);
  }

  return pub;
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
