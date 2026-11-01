# Contrato do Banco de Dados — RotuScan (`RotuScanDB`)

Este documento descreve o esquema oficial das coleções no MongoDB Atlas compartilhadas entre o **App Mobile (Expo / React Native)** e o **Painel Web do Nutricionista (Next.js)**.

---

## 1. Banco Oficial

- **Database**: `RotuScanDB`
- **Variável de ambiente**: `MONGO_URI` (ou `MONGODB_URI`)

---

## 2. Coleções Oficiais

### 2.1 `users` (Model `User`)

Armazena tanto pacientes do aplicativo mobile quanto nutricionistas do painel web.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `_id` | `ObjectId` | Sim | Auto | Identificador único do usuário |
| `nome` | `String` | Sim | — | Nome completo (`trim`) |
| `email` | `String` | Sim | — | E-mail único (`unique`, `lowercase`, `trim`) |
| `senha` | `String` | Sim | — | Hash `bcryptjs` (`select: false` nas consultas padrão) |
| `avatar` | `String \| null` | Não | `null` | URL ou caminho relativo da foto de perfil |
| `role` | `'PACIENTE' \| 'NUTRICIONISTA'` | Sim | `'PACIENTE'` | Papel do usuário no ecossistema |
| `nutricionistaId` | `ObjectId \| null` | Não | `null` | Referência (`ref: 'User'`) ao nutricionista responsável |
| `restricoes` | `Array<'gluten' \| 'lactose' \| 'amendoim'>` | Sim | `[]` | Lista de intolerâncias/alergias ativas do paciente |
| `niveisSensibilidade.gluten` | `0 \| 1 \| 2` | Sim | `1` | `0` = Leve (ignora "pode conter"), `1` = Moderado, `2` = Grave |
| `niveisSensibilidade.lactose` | `0 \| 1 \| 2` | Sim | `1` | `0` = Leve (ignora "pode conter"), `1` = Moderado, `2` = Grave |
| `niveisSensibilidade.amendoim` | `0 \| 1 \| 2` | Sim | `1` | `0` = Leve (ignora "pode conter"), `1` = Moderado, `2` = Grave |
| `restricoesAtualizadasEm` | `Date \| null` | Não | `null` | Data/hora da última alteração nas restrições |
| `restricoesAtualizadasPor` | `'PACIENTE' \| 'NUTRICIONISTA' \| null` | Não | `null` | Quem realizou a última alteração de perfil alimentar |
| `createdAt` | `Date` | Sim | Auto | Data de criação |
| `updatedAt` | `Date` | Sim | Auto | Data da última atualização |

> [!IMPORTANT]
> Quando o painel Web do nutricionista alterar as restrições ou níveis de um paciente, deve gravar `restricoesAtualizadasEm: new Date()` e `restricoesAtualizadasPor: 'NUTRICIONISTA'`. O aplicativo mobile consulta o banco a cada foco de tela e no momento do escaneamento (`POST /scanner`), refletindo imediatamente a mudança.

---

### 2.2 `allergendictionaries` (Model `AllergenDictionary`)

Dicionário central de sinônimos e derivados químicos para cada categoria de alérgeno. O painel do nutricionista pode adicionar ou editar termos nesta coleção.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | `ObjectId` | Sim | Identificador único |
| `categoria` | `'gluten' \| 'lactose' \| 'amendoim'` | Sim (`unique`) | Chave canônica da intolerância |
| `sinonimos` | `Array<String>` | Sim | Termos e derivados buscados pelo motor de OCR |
| `createdAt` | `Date` | Sim | Data de criação |
| `updatedAt` | `Date` | Sim | Data da última atualização |

---

### 2.3 `scanlogs` (Model `ScanLog`)

Histórico completo de escaneamentos realizados pelos pacientes (incluindo itens curtidos/favoritos).

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `_id` | `ObjectId` | Sim | Auto | Identificador único do escaneamento |
| `userId` | `ObjectId` | Sim (`index`) | — | Referência (`ref: 'User'`) ao dono do escaneamento |
| `nomeProduto` | `String` | Sim | `'Produto analisado'` | Nome automático (ex: `"Produto com Glúten"`) ou nome editado pelo usuário |
| `nomeAutomatico` | `Boolean` | Sim | `true` | `true` enquanto for gerado pelo sistema; `false` após renomeação manual |
| `nomeBusca` | `String` | Sim | `''` | Versão normalizada sem acentos e minúscula de `nomeProduto` para busca rápida |
| `marcaPeso` | `String \| null` | Não | `null` | Marca e peso opcionais (ex: `"Marca ElmaChips • 100g"`) |
| `imagemArquivo` | `String \| null` | Não | `null` | Caminho relativo em `server/uploads/` (`scans/<userId>/<logId>.jpg`) |
| `imagemDemo` | `String \| null` | Não | `null` | Nome de arquivo estático de demonstração (quando `seed: true`) |
| `textoBruto` | `String` | Sim | `''` | Texto integral extraído pelo Tesseract OCR |
| `veredito` | `'SEGURO' \| 'PERIGOSO'` | Sim | — | Resultado final para o perfil do usuário no momento da leitura |
| `alergicosDetectados` | `Array<{ categoria, tipo, termos }>` | Sim | `[]` | `categoria`: `'gluten'\|'lactose'\|'amendoim'`, `tipo`: `'CONTEM'\|'TRACOS'`, `termos`: `String[]` |
| `ingredientesDetalhados` | `Array<{ nome, risco, fonte }>` | Sim | `[]` | Ingredientes individuais extraídos, com itens de risco no topo |
| `curtido` | `Boolean` | Sim | `false` | Indica se o produto está nos favoritos ("Itens Curtidos") |
| `seed` | `Boolean` | Sim | `false` | `true` apenas para registros inseridos via `seed-demo.js` |
| `createdAt` | `Date` | Sim | Auto | Data/hora do escaneamento |
| `updatedAt` | `Date` | Sim | Auto | Data/hora da última atualização |

#### Índices de `scanlogs`
1. `{ userId: 1, createdAt: -1 }` — listagem cronológica do histórico por usuário.
2. `{ userId: 1, curtido: 1, createdAt: -1 }` — listagem rápida da aba de favoritos ("Itens Curtidos").

