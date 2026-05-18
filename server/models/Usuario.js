const mongoose = require('mongoose');

// Schema para persistencia de dados cadastrais do usuario
const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  // TODO: Implementacao de preferencias de restricao vinculadas ao usuario
});

module.exports = mongoose.model('Usuario', UsuarioSchema);