require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const tesseract = require("node-tesseract-ocr");
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. MODELOS (Schemas do Banco de Dados)
// ==========================================
const Usuario = mongoose.model('Usuario', new mongoose.Schema({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  senha: { type: String, required: true }
}));

const Restricao = mongoose.model('Restricao', new mongoose.Schema({
  categoria: { type: String, required: true, unique: true }, // ex: 'lactose'
  sinonimos: [{ type: String }] 
}));


// ==========================================
// 2. CONEXÃO COM O MONGODB ATLAS E POPULAÇÃO INICIAL
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Conectado ao MongoDB Atlas com sucesso.");
    
    // 1. Remoção de índices antigos para evitar conflitos de restrição única (E11000)
    try {
      await Restricao.collection.dropIndexes();
    } catch (e) { 
      // Ignora silenciosamente se não houver índices antigos
    }

    // 2. AUTO-SEED: Verifica se precisa popular
    const count = await Restricao.countDocuments();
    
    if (count < 3) {
      console.log("Populando base de dados de restricoes...");
      await Restricao.deleteMany({});
      
      const dadosIniciais = [
        { 
          categoria: 'lactose', 
          sinonimos: [
            'leite', 'lactose', 'soro de leite', 'manteiga', 'queijo', 'caseína', 
            'creme de leite', 'nata', 'coalhada', 'iogurte', 'kefir', 'leite em pó', 
            'proteína do leite', 'lactoalbumina', 'lactoglobulina'
          ] 
        },
        { 
          categoria: 'gluten', 
          sinonimos: [
            'gluten', 'glúten', 'trigo', 'centeio', 'cevada', 'malte', 'aveia', 
            'farinha de trigo', 'espelta', 'triticale', 'kamut', 'farelo', 'germe', 
            'amido de trigo', 'proteína vegetal hidrolisada', 'farinha'
          ] 
        },
        { 
          categoria: 'amendoim', 
          sinonimos: [
            'amendoim', 'amendoins', 'óleo de amendoim', 'pasta de amendoim', 
            'manteiga de amendoim', 'paçoca', 'extrato de amendoim', 'cacauete'
          ] 
        }
      ];
      await Restricao.insertMany(dadosIniciais);
      console.log("Base de restricoes inicializada com sucesso.");
    } else {
      console.log(`Base de dados consistente: ${count} categorias registradas.`);
    }
  })
  .catch(err => console.error("Erro ao conectar ao MongoDB:", err));
  
// ==========================================
// 3. CONFIG TESSERACT
// ==========================================
const config = {
  lang: "por", oem: 1, psm: 3,
  binary: '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"' 
};


// ==========================================
// 4. ROTAS DE AUTENTICAÇÃO E PERFIL
// ==========================================
app.post('/api/cadastro', async (req, res) => {
  console.log("Requisicao recebida em /api/cadastro");
  try {
    const novoUsuario = new Usuario(req.body);
    await novoUsuario.save();
    console.log("Usuario salvo com sucesso no MongoDB.");
    res.status(201).json({ mensagem: "Usuário criado!" });
  } catch (error) {
    console.error("Erro ao salvar usuario:", error.message);
    res.status(400).json({ erro: "Email já cadastrado ou erro nos dados enviados." });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email, senha });
  if (!usuario) return res.status(401).json({ erro: "Credenciais inválidas." });
  
  // Retorno de dados do usuario para persistencia local
  res.json({ usuarioId: usuario._id, nome: usuario.nome, email: usuario.email });
});

// Rota para atualização de dados cadastrais e credenciais
app.put('/api/usuario/atualizar', async (req, res) => {
  const { id, nome, email, senha } = req.body;
  console.log(`Atualizacao de perfil solicitada para o ID: ${id}`);

  try {
    // Monta o objeto com os campos obrigatórios
    const dadosAtualizacao = { nome, email };

    // Se o usuário digitou uma senha nova, inclui ela no update
    if (senha) {
      dadosAtualizacao.senha = senha;
    }

    // Busca pelo ID do MongoDB e faz a alteração
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(id, dadosAtualizacao, { new: true });

    if (!usuarioAtualizado) {
      return res.status(404).json({ erro: "Usuário não localizado no sistema." });
    }

    console.log("Perfil modificado com sucesso no MongoDB.");
    // Retorno conforme estrutura esperada pelo componente EditarPerfilScreen
    res.json({ sucesso: true, mensagem: "Perfil atualizado com sucesso!" });

  } catch (error) {
    console.error("Erro ao atualizar perfil:", error.message);
    res.status(500).json({ erro: "Erro interno ao tentar salvar as alterações." });
  }
});


// ==========================================
// 5. ROTA DO SCANNER (Consultando a Nuvem)
// ==========================================
const upload = multer({ dest: 'uploads/' });

app.post('/scanner', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).send('Nenhuma imagem enviada.');

  try {
    const restricoesUsuarioStr = req.body.restricoes;
    const restricoesUsuario = restricoesUsuarioStr ? JSON.parse(restricoesUsuarioStr) : [];
    
    console.log(`Analise de restricoes do usuario: ${restricoesUsuario.join(', ')}`);

    const text = await tesseract.recognize(req.file.path, config);
    const textLower = text.toLowerCase().replace(/(\r\n|\n|\r)/gm, " "); 
    
    console.log("--- TEXTO LIDO DO RÓTULO ---");
    console.log(textLower);
    console.log("----------------------------");

    const restricoesDoBanco = await Restricao.find({ categoria: { $in: restricoesUsuario } });

    let alergicosEncontrados = [];

    restricoesDoBanco.forEach(restricaoDoc => {
      const categoria = restricaoDoc.categoria;
      const palavrasProibidas = restricaoDoc.sinonimos;

      palavrasProibidas.forEach(palavra => {
        if (textLower.includes(palavra)) {
          // Verificação de termos que indicam ausência do alergênico
          const falsoPos1 = `não contém ${palavra}`;
          const falsoPos2 = `sem ${palavra}`;
          const falsoPos3 = `0% ${palavra}`;

          if (!textLower.includes(falsoPos1) && !textLower.includes(falsoPos2) && !textLower.includes(falsoPos3)) {
            if (!alergicosEncontrados.includes(categoria)) {
              alergicosEncontrados.push(categoria);
            }
          }
        }
      });
    });

    res.json({
      sucesso: true,
      status: alergicosEncontrados.length > 0 ? "PERIGO" : "SEGURO",
      alergicosEncontrados: alergicosEncontrados
    });

  } catch (error) {
    console.error("Erro no OCR:", error);
    res.status(500).json({ erro: error.message });
  }
});

// Inicializa o Servidor
app.listen(3000, '0.0.0.0', () => {
  console.log("Servidor rodando na porta 3000");
});