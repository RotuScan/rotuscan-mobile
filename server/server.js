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
// 2. CONEXÃO COM O MONGODB ATLAS & SUPER AUTO-SEED
// ==========================================
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("🔥 Conectado ao MongoDB Atlas com sucesso!");
    
    // 1. O CAÇA-FANTASMAS: Remove regras antigas (índices) que causam o erro E11000
    try {
      await Restricao.collection.dropIndexes();
    } catch (e) { 
      // Ignora silenciosamente se não houver índices antigos
    }

    // 2. AUTO-SEED: Verifica se precisa popular
    const count = await Restricao.countDocuments();
    
    // Se tiver menos de 4, significa que a instalação anterior falhou pela metade
    if (count < 4) {
      console.log("⚙️ Reestruturando o banco de restrições...");
      
      // Limpa os dados pela metade (como a lactose que ficou presa lá)
      await Restricao.deleteMany({});
      
      // O SUPER DICIONÁRIO ATUALIZADO
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
        },
        { 
          categoria: 'acucar', 
          sinonimos: [
            'açúcar', 'acucar', 'sacarose', 'glicose', 'frutose', 'xarope', 
            'maltodextrina', 'dextrose', 'mel', 'melaço', 'agave', 'açúcar invertido', 
            'amido modificado', 'xarope de milho'
          ] 
        }
      ];
      await Restricao.insertMany(dadosIniciais);
      console.log("✅ Inteligência ampliada cadastrada no banco de dados com sucesso!");
    } else {
      console.log(`✅ O banco já possui ${count} categorias de restrições cadastradas.`);
    }
  })
  .catch(err => console.error("❌ Erro ao conectar ao MongoDB:", err));
  
// ==========================================
// 3. CONFIG TESSERACT
// ==========================================
const config = {
  lang: "por", oem: 1, psm: 3,
  binary: '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"' 
};


// ==========================================
// 4. ROTAS DE AUTENTICAÇÃO
// ==========================================
app.post('/api/cadastro', async (req, res) => {
  try {
    const novoUsuario = new Usuario(req.body);
    await novoUsuario.save();
    res.status(201).json({ mensagem: "Usuário criado!" });
  } catch (error) {
    res.status(400).json({ erro: "Email já cadastrado ou erro no servidor." });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email, senha });
  if (!usuario) return res.status(401).json({ erro: "Credenciais inválidas." });
  res.json({ usuarioId: usuario._id, nome: usuario.nome });
});


// ==========================================
// 5. ROTA DO SCANNER (Consultando a Nuvem)
// ==========================================
const upload = multer({ dest: 'uploads/' });

app.post('/scanner', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).send('Nenhuma imagem enviada.');

  try {
    // 1. Pega a lista de restrições que o celular mandou
    const restricoesUsuarioStr = req.body.restricoes;
    const restricoesUsuario = restricoesUsuarioStr ? JSON.parse(restricoesUsuarioStr) : [];
    
    console.log(`🔍 Usuário analisando restrições: ${restricoesUsuario.join(', ')}`);

    // 2. OCR: Usa o Tesseract para ler a imagem
    const text = await tesseract.recognize(req.file.path, config);
    const textLower = text.toLowerCase().replace(/(\r\n|\n|\r)/gm, " "); 
    
    console.log("--- TEXTO LIDO DO RÓTULO ---");
    console.log(textLower);
    console.log("----------------------------");

    // 3. BUSCA NO BANCO DE DADOS (A Mágica acontece aqui)
    const restricoesDoBanco = await Restricao.find({ categoria: { $in: restricoesUsuario } });

    let alergicosEncontrados = [];

    // 4. Analisa os dados do Banco contra o Texto do Rótulo
    restricoesDoBanco.forEach(restricaoDoc => {
      const categoria = restricaoDoc.categoria;
      const palavrasProibidas = restricaoDoc.sinonimos; // Pega os sinônimos do banco

      palavrasProibidas.forEach(palavra => {
        if (textLower.includes(palavra)) {
          // Verifica os falsos positivos (ex: "não contém glúten")
          const falsoPos1 = `não contém ${palavra}`;
          const falsoPos2 = `sem ${palavra}`;
          const falsoPos3 = `0% ${palavra}`;

          if (!textLower.includes(falsoPos1) && !textLower.includes(falsoPos2) && !textLower.includes(falsoPos3)) {
            // Achou e é perigo real!
            if (!alergicosEncontrados.includes(categoria)) {
              alergicosEncontrados.push(categoria);
            }
          }
        }
      });
    });

    // 5. Devolve o resultado pro celular
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
  console.log("🚀 Servidor Atlas ON na porta 3000");
});