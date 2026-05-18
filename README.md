# rotuscan-mobile
Documentação Técnica do Sistema
Guia Unificado de Instalação, Configuração e Execução do Ambiente Local (Mobile e Backend)

Projeto:

RotuScan - Análise de
Alergênicos por
Processamento de
Imagem

Ambiente:

Local (Desenvolvimento /
Homologação)

Destinatários:

Banca Examinadora /
Corpo Docente

Tecnologias:

React Native (Expo),
Node.js, MongoDB Atlas,
Tesseract OCR

1. Visão Geral do Ecossistema
O RotuScan é composto por duas aplicações integradas: um ecossistema mobile desenvolvido em React
Native (Expo) e um servidor de processamento em Node.js (Express) responsável pela persistência em
nuvem e execução do mecanismo de Reconhecimento Óptico de Caracteres (OCR). Para a correta
validação do projeto, ambas as partes precisam estar operando simultaneamente na mesma rede local.
2. Configuração do Servidor (Backend)
O ambiente backend processa as requisições de autenticação, gerencia as restrições alimentares no
MongoDB Atlas e executa a extração textual através do binário nativo do Tesseract OCR.
2.1. Instalação Obrigatória do Tesseract OCR (Windows)
O mecanismo de OCR do servidor depende diretamente do motor nativo do Tesseract instalado no sistema
operacional host. Siga rigorosamente os passos abaixo para configuração:
Faça o download do instalador estável do Tesseract OCR para Windows de 64 bits (preferencialmente
mantido por UB Mannheim).
Execute o instalador e prossiga até a tela de seleção de componentes adicionais (Additional script data e
Additional language data).
Importante: Expanda a lista de linguagens e marque a opção Portuguese (por) para habilitar o
dicionário em português.
Conclua a instalação certificando-se de manter o caminho padrão sugerido pelo sistema:
C:\Program Files\Tesseract-OCR\tesseract.exe
Nota: Se o binário for instalado em outro local, a constante de configuração interna da propriedade binary
no arquivo server.js precisará ser alterada manualmente.
1.

2.

3.

4.

RotuScan - Manual de Configuração Local 1

2.2. Configuração do Arquivo de Variáveis de Ambiente (.env)
A conexão estável com o banco de dados depende do isolamento de credenciais na raiz do projeto backend.
Crie um arquivo exatamente nomeado como .env na raiz do diretório do servidor e adicione a seguinte
estrutura:
MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/rotuscan?
retryWrites=true&w=majority
Substitua os campos <usuario> , <senha> e <cluster> pelas credenciais válidas fornecidas para
acesso ao MongoDB Atlas na nuvem.
2.3. Instalação de Dependências do Servidor
Navegue até o diretório do servidor via terminal de comandos e execute a instalação das dependências
listadas no manifesto do ecossistema:
npm install
Os seguintes pacotes fundamentais serão baixados e configurados:
Dependência Versão
Base

Finalidade no Ecossistema Backend

express Mapeada

Framework HTTP estrutural para gerenciamento de rotas e
middlewares.

mongoose Mapeada

Modelagem de dados e abstração de consultas baseadas em
esquemas (ODM) para o MongoDB.

multer Mapeada

Middleware focado no tratamento e armazenamento temporário
de uploads Multipart/Form-Data (Imagens).

node-tesseract-ocr Mapeada

Mapeamento e ponte de execução assíncrona da biblioteca
Node para o binário do sistema host.

cors Mapeada

Mecanismo de liberação de compartilhamento de recursos de
origens cruzadas, autorizando as requisições do app mobile.

dotenv Mapeada

Carregamento e injeção automática das variáveis do arquivo
.env no escopo global do process.env .

3. Configuração do Aplicativo (Mobile)
A aplicação mobile opera em cima do ecossistema do Expo, permitindo a emulação simplificada em
dispositivos físicos e simuladores virtuais.

RotuScan - Manual de Configuração Local 2

3.1. Sincronização do Endereço IP Local
Atenção Crítica de Comunicação de Rede
Dispositivos físicos rodando o Expo Go não conseguem resolver o endereço localhost ou
127.0.0.1 para se comunicar com o computador de desenvolvimento. O celular e o computador
devem estar obrigatoriamente conectados na mesma rede Wi-Fi.
Para mapear o endereço IP local do seu computador hospedeiro:
Abra o terminal de comandos e execute ipconfig (no Windows) ou ifconfig (no Linux/macOS).
Localize o IPv4 operacional da sua interface de rede local sem fio (Exemplo: 192.168.1.8 ).
Abra o arquivo de centralização de requisições do aplicativo mobile (geralmente localizado em
services/api.ts ) e atualize a URL base com o IP mapeado:
baseURL: 'http://192.168.1.8:3000'
Certifique-se de realizar a mesma atualização na constante local SEU_IP_LOCAL contida no arquivo app/
(tabs)/scanner.tsx para garantir a correta transmissão das imagens Multipart/Form-Data para o servidor.
3.2. Instalação das Dependências Mobile
Abra o terminal apontando para a raiz do projeto mobile e execute o instalador padrão do gerenciador de
pacotes Node para obter o escopo de bibliotecas nativas:
npm install
Principais módulos integrados para o funcionamento estável da aplicação mobile:
Módulo Escopo e Função no Aplicativo Mobile

expo-router

Gerenciador nativo de rotas baseado em sistema de arquivos e subdiretórios
(Tabs/Drawer).

expo-camera

Acesso e controle nativo aos fluxos de câmera do dispositivo móvel para captura
em alta resolução.

@react-native-
async-storage/

async-storage

Persistência local leve de chaves-valores no celular para controle de dados de
sessão e alérgenos ativos.

axios

Cliente HTTP otimizado usado para a comunicação rest estruturada com o
backend.

react-native-safe-
area-context

Cálculo dinâmico automatizado de margens físicas de telas do dispositivo (Notch,
barras de navegação).

1.
2.
3.

•

RotuScan - Manual de Configuração Local 3

4. Sequência Operacional de Inicialização
Para testar o ecossistema completo integrado de forma bem-sucedida, siga rigorosamente a ordem
sequencial de boot das aplicações abaixo:
Passo 1: Inicialização do Servidor Backend
Abra um terminal dedicado na pasta raiz do servidor backend e ative o processo Node executando:
node server.js
Certifique-se de ler a confirmação da conexão estável com o cluster na nuvem do Atlas e validação
bem-sucedida da base de dicionários (Seed).

Passo 2: Limpeza de Cache e Inicialização Mobile
Em um terminal secundário direcionado para a pasta da aplicação mobile, force a inicialização do Metro
Bundler limpando dados de cache antigos acumulados:
npx expo start -c
Utilize o aplicativo do Expo Go no smartphone físico para ler o código QR gerado na tela ou execute um
simulador conectado na máquina.

5. Resolução de Falhas de Execução (Troubleshooting)
Erro de Conexão com o Servidor (Network Error / 404): Certifique-se de que o firewall do Windows
não esteja bloqueando conexões de entrada na porta 3000 e valide se o IP do computador hospedeiro
não mudou devido ao protocolo dinâmico DHCP do roteador Wi-Fi.
Processo Travado na Porta 3000 (Windows): Caso o sistema operacional informe que a porta já está
ocupada por um processo fantasma em background, execute o seguinte comando no terminal para liberar
a memória física da máquina:
taskkill /f /im node.exe
