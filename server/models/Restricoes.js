import mongoose from 'mongoose';

const restricaoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  chaves: {
    type: [String],
    required: true
  }
});

export const RestricaoModel = mongoose.model('Restricao', restricaoSchema, 'restricoes');