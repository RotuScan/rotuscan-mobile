import mongoose from 'mongoose';

const rotuloSchema = new mongoose.Schema({
  produto: { type: String, required: true },
  ingredientes: { type: String, required: true }
});

export const RotuloModel = mongoose.model('Rotulo', rotuloSchema, 'rotulos');