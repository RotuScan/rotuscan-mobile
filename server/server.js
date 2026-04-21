const express = require('express');
const multer = require('multer');
const tesseract = require("node-tesseract-ocr");
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();

// Configuração do Multer para salvar a imagem corretamente
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, 'foto-' + Date.now() + '.jpg')
  }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());

// 1. BANCO DE DADOS (Agora com a trava UNIQUE para não repetir)
const db = new sqlite3.Database('./saluscore.db');
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS restricoes (id INTEGER PRIMARY KEY, termo TEXT UNIQUE)");
  
  const termosIniciais = ['leite', 'gluten', 'soja', 'amendoim', 'açúcar'];
  const stmt = db.prepare("INSERT OR IGNORE INTO restricoes (termo) VALUES (?)");
  termosIniciais.forEach(termo => stmt.run(termo));
  stmt.finalize();
});

// 2. TESSERACT
const config = {
  lang: "por",
  oem: 1,
  psm: 3,
  binary: '"C:\\Program Files\\Tesseract-OCR\\tesseract.exe"' 
};

// 3. ROTA INTELIGENTE
app.post('/scanner', upload.single('photo'), async (req, res) => {
  if (!req.file) return res.status(400).send('Nenhuma imagem enviada.');

  try {
    console.log("Processando imagem...");
    const text = await tesseract.recognize(req.file.path, config);
    // Removemos quebras de linha para facilitar a busca
    const textLower = text.toLowerCase().replace(/(\r\n|\n|\r)/gm, " "); 
    
    console.log("Texto lido:", textLower.substring(0, 50) + "..."); // Mostra só o começo no log para não poluir

    db.all("SELECT termo FROM restricoes", [], (err, rows) => {
      if (err) throw err;

      // LÓGICA ANTI FALSO-POSITIVO
      const encontrados = rows.filter(row => {
        const termo = row.termo.toLowerCase();
        
        // Se a palavra não existe no rótulo, ignora.
        if (!textLower.includes(termo)) return false;

        // Se a palavra existe, verifica se NÃO é um aviso de segurança
        const falsoPositivo1 = `não contém ${termo}`;
        const falsoPositivo2 = `não contem ${termo}`;
        const falsoPositivo3 = `sem ${termo}`;
        const falsoPositivo4 = `0% ${termo}`;

        if (textLower.includes(falsoPositivo1) || textLower.includes(falsoPositivo2) || textLower.includes(falsoPositivo3) || textLower.includes(falsoPositivo4)) {
            return false; // É falso positivo, então diz que é SEGURO
        }

        return true; // Se tem a palavra e não tem "não contém" antes, é PERIGO
      });
      
      res.json({
        sucesso: true,
        alergicosEncontrados: encontrados.map(e => e.termo),
        status: encontrados.length > 0 ? "PERIGO" : "SEGURO"
      });
    });
  } catch (error) {
    console.error("Erro no OCR:", error);
    res.status(500).json({ sucesso: false, erro: error.message });
  }
});

app.listen(3000, '0.0.0.0', () => {
  console.log("✅ Servidor rodando em http://localhost:3000");
});