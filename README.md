📱 RotuScan Mobile
Documentação Técnica do Sistema
Guia Unificado de Instalação, Configuração e Execução do Ambiente Local
📌 Sobre o Projeto

O RotuScan é um sistema desenvolvido para auxiliar usuários na identificação de alergênicos em rótulos alimentícios por meio de Processamento de Imagem e OCR (Reconhecimento Óptico de Caracteres).

O ecossistema é dividido em duas aplicações integradas:

📱 Aplicativo Mobile desenvolvido em React Native com Expo
🌐 Servidor Backend desenvolvido em Node.js com Express

O backend é responsável pelo processamento OCR via Tesseract, autenticação e persistência de dados no MongoDB Atlas.

👥 Destinatários
Banca Examinadora
Corpo Docente
Desenvolvedores responsáveis pela validação do sistema
🛠️ Tecnologias Utilizadas
Tecnologia	Finalidade
React Native + Expo	Aplicação mobile
Node.js + Express	Servidor backend
MongoDB Atlas	Banco de dados em nuvem
Tesseract OCR	Reconhecimento óptico de caracteres
Axios	Comunicação HTTP
Mongoose	Modelagem ODM
⚙️ Estrutura do Ecossistema

Para o funcionamento completo do projeto, é necessário executar:

[ Aplicativo Mobile ]
          ↓
 Comunicação HTTP (Wi-Fi Local)
          ↓
[ Servidor Node.js ]
          ↓
[ MongoDB Atlas + OCR ]

⚠️ O dispositivo mobile e o computador devem estar conectados na mesma rede Wi-Fi.

🖥️ Configuração do Backend

O backend é responsável por:

autenticação;
gerenciamento das restrições alimentares;
comunicação com o MongoDB Atlas;
execução do Tesseract OCR.
1️⃣ Instalação do Tesseract OCR (Windows)

O servidor depende do binário nativo do Tesseract instalado no sistema operacional.

Passo a passo
Faça o download da versão estável do Tesseract OCR 64 bits
(preferencialmente a distribuição mantida por UB Mannheim).
Execute o instalador.
Na etapa Additional language data, marque:
Portuguese (por)
Finalize mantendo o caminho padrão:
C:\Program Files\Tesseract-OCR\tesseract.exe
⚠️ Observação Importante

Caso o Tesseract seja instalado em outro diretório, será necessário alterar manualmente a propriedade:

binary

no arquivo:

server.js
🔐 Configuração do Arquivo .env

Na raiz do projeto backend, crie um arquivo chamado:

.env

Adicione a seguinte estrutura:

MONGODB_URI=mongodb+srv://USUARIO:SENHA@CLUSTER.mongodb.net/rotuscan?retryWrites=true&w=majority

Substitua:

Campo	Descrição
USUARIO	Usuário do MongoDB Atlas
SENHA	Senha do banco
CLUSTER	Nome do cluster
📦 Instalação das Dependências do Backend

No terminal, acesse a pasta do servidor e execute:

npm install
Dependências Principais
Dependência	Função
express	Gerenciamento de rotas e middlewares
mongoose	Modelagem ODM para MongoDB
multer	Upload de imagens Multipart/Form-Data
node-tesseract-ocr	Integração com o Tesseract OCR
cors	Liberação de acesso entre origens
dotenv	Carregamento de variáveis de ambiente
📱 Configuração do Aplicativo Mobile

O aplicativo mobile opera através do ecossistema Expo.

1️⃣ Configuração do IP Local
⚠️ Atenção Crítica

Dispositivos físicos utilizando Expo Go não conseguem acessar:

localhost

ou

127.0.0.1

Portanto, o celular deve utilizar o IP local da máquina hospedeira.

Descobrindo o IP da Máquina
Windows
ipconfig
Linux/macOS
ifconfig

Localize o IPv4 da rede local.

Exemplo:

192.168.1.8
Atualização da URL Base

No arquivo:

services/api.ts

Atualize:

baseURL: 'http://192.168.1.8:3000'
Atualização do Scanner

No arquivo:

app/(tabs)/scanner.tsx

Atualize a constante:

SEU_IP_LOCAL

com o mesmo IP configurado anteriormente.

📦 Instalação das Dependências Mobile

Na raiz do projeto mobile, execute:

npm install
Principais Bibliotecas
Biblioteca	Finalidade
expo-router	Sistema de rotas
expo-camera	Captura de imagens
@react-native-async-storage/async-storage	Persistência local
axios	Comunicação HTTP
react-native-safe-area-context	Ajuste automático de áreas seguras
🚀 Inicialização do Sistema
1️⃣ Inicializar o Backend

Na pasta do servidor:

node server.js

Verifique se o terminal exibe:

conexão com o MongoDB Atlas;
carregamento da seed;
inicialização do servidor.
2️⃣ Inicializar o Mobile

Na pasta do aplicativo:

npx expo start -c

O parâmetro -c limpa o cache do Metro Bundler.

3️⃣ Executar no Dispositivo

Abra o aplicativo Expo Go no celular e:

escaneie o QR Code;
ou utilize um simulador.
🧪 Troubleshooting
❌ Network Error / Erro 404

Verifique:

se o backend está ativo;
se o IP configurado está correto;
se o celular e o computador estão na mesma rede;
se o firewall do Windows não está bloqueando a porta 3000.
❌ Porta 3000 já em uso

No Windows, execute:

taskkill /f /im node.exe
✅ Requisitos para Execução
Requisito	Necessário
Node.js instalado	✅
Expo Go no celular	✅
MongoDB Atlas configurado	✅
Tesseract OCR instalado	✅
Mesma rede Wi-Fi	✅
funcionamento adequado do OCR;
persistência segura de dados na nuvem;
validação completa do ecossistema durante apresentações e homologações.
