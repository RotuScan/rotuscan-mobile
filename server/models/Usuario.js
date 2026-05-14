const mongoose = require('mongoose');

// Define como o usuário será salvo no banco de dados
const UsuarioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true },
  // Futuramente colocaremos as intolerâncias aqui!
});

module.exports = mongoose.model('Usuario', UsuarioSchema);