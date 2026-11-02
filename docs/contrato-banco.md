# Contrato do Banco de Dados e API — RotuScan (`RotuScanDB`)

Este documento descreve o esquema oficial das coleções no MongoDB Atlas (`RotuScanDB`), as regras de negócio de vínculo Nutricionista ↔ Paciente e as consultas e rotas compartilhadas entre o **App Mobile (Expo / React Native)** e o **Painel Web do Nutricionista (Next.js)**.

---

## 1. Banco Oficial e Padronização de Erros

- **Database**: `RotuScanDB`
- **Variável de ambiente**: `MONGO_URI` (ou `MONGODB_URI`)
- **Formato padrão de erro HTTP (400, 401, 403, 404, 409, 429, 500)**:
  ```json
  {
    "mensagem": "Descrição amigável do erro em português",
    "erro": "Descrição amigável do erro em português",
    "campos": {
      "nomeDoCampo": "Mensagem específica de validação do campo"
    }
  }
  ```

---

## 2. Coleções Oficiais

### 2.1 `users` (Model `User`)

Armazena tanto pacientes do aplicativo mobile (`role: 'PACIENTE'`) quanto nutricionistas do painel web (`role: 'NUTRICIONISTA'`).

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `_id` | `ObjectId` | Sim | Auto | Identificador único do usuário |
| `nome` | `String` | Sim (`maxlength: 100`) | — | Nome completo (`trim`) |
| `email` | `String` | Sim (`unique`, `maxlength: 160`) | — | E-mail único (`lowercase`, `trim`) |
| `senha` | `String` | Sim | — | Hash `bcryptjs` (`select: false` nas consultas padrão) |
| `avatar` | `String \| null` | Não | `null` | Data URI Base64 (`data:image/jpeg;base64,...`) ou URL da foto de perfil |
| `role` | `'PACIENTE' \| 'NUTRICIONISTA'` | Sim | `'PACIENTE'` | Papel do usuário no ecossistema |
| `crn` | `String \| null` | Só Nutricionista (`maxlength: 30`) | `null` | Registro no Conselho Regional de Nutricionistas *(Nota TCC: o CRN é autodeclarado e não é validado junto ao CFN/CRN)* |
| `tratamento` | `'Dr.' \| 'Dra.' \| 'Nutri.' \| null` | Não | `null` | Pronome de tratamento exibido para o paciente |
| `codigoVinculo` | `String` (`unique`, `sparse`) | Só Nutricionista | `undefined` | Código único de 8 caracteres (`ABCDEFGHJKMNPQRSTUVWXYZ23456789`, sem `I, L, O, 0, 1`), armazenado sem hífen em maiúsculas (ex.: `ABCD2345`) e exibido como `ABCD-2345` |
| `nutricionistaId` | `ObjectId \| null` (`index`) | Não | `null` | Referência (`ref: 'User'`) ao nutricionista vinculado (deve apontar exclusivamente para usuário com `role: 'NUTRICIONISTA'`) |
| `vinculadoEm` | `Date \| null` | Não | `null` | Data/hora em que o paciente confirmou o vínculo atual |
| `consentimentoVinculoEm` | `Date \| null` | Não | `null` | Data/hora do consentimento de compartilhamento de dados com o nutricionista |
| `restricoes` | `Array<'gluten' \| 'lactose' \| 'amendoim'>` | Sim | `[]` | Lista de intolerâncias/alergias ativas do paciente |
| `niveisSensibilidade.gluten` | `0 \| 1 \| 2` | Sim | `1` | `0` = Leve (ignora "pode conter"), `1` = Moderado, `2` = Grave |
| `niveisSensibilidade.lactose` | `0 \| 1 \| 2` | Sim | `1` | `0` = Leve (ignora "pode conter"), `1` = Moderado, `2` = Grave |
| `niveisSensibilidade.amendoim` | `0 \| 1 \| 2` | Sim | `1` | `0` = Leve (ignora "pode conter"), `1` = Moderado, `2` = Grave |
| `restricoesAtualizadasEm` | `Date \| null` | Não | `null` | Data/hora da última alteração nas restrições |
| `restricoesAtualizadasPor` | `'PACIENTE' \| 'NUTRICIONISTA' \| null` | Não | `null` | Quem realizou a última alteração de perfil alimentar |
| `createdAt` | `Date` | Sim | Auto | Data de criação |
| `updatedAt` | `Date` | Sim | Auto | Data da última atualização |

#### Índices de `users`
1. `{ email: 1 }` — `unique: true`
2. `{ codigoVinculo: 1 }` — `unique: true, sparse: true`
3. `{ nutricionistaId: 1 }` — listagem rápida dos pacientes vinculados a um nutricionista.

---

### 2.2 `scanlogs` (Model `ScanLog`)

Histórico completo de escaneamentos realizados pelos pacientes (incluindo itens curtidos/favoritos).

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `_id` | `ObjectId` | Sim | Auto | Identificador único do escaneamento |
| `userId` | `ObjectId` | Sim (`index`) | — | Referência (`ref: 'User'`) ao dono do escaneamento |
| `nomeProduto` | `String` | Sim (`maxlength: 80`) | `'Produto Seguro'` | Nome automático (ex: `"Produto com Glúten"`) ou nome editado pelo usuário |
| `nomeAutomatico` | `Boolean` | Sim | `true` | `true` enquanto for gerado pelo sistema; `false` após renomeação manual |
| `nomeBusca` | `String` | Sim (`maxlength: 120`) | `''` | Versão normalizada sem acentos e minúscula de `nomeProduto` para busca rápida |
| `marca` | `String` | Não (`maxlength: 60`) | `''` | Marca informada pelo usuário (ex: `"ElmaChips"`) |
| `peso` | `String` | Não (`maxlength: 30`) | `''` | Peso/volume informado pelo usuário (ex: `"100g"`) |
| `marcaPeso` | `String` | Não (`maxlength: 100`) | `''` | String montada automaticamente (`"Marca • Peso"`) mantida por compatibilidade |
| `imagemUri` | `String \| null` | Não | `null` | Miniatura JPEG comprimida em Base64 (`data:image/jpeg;base64,...`) |
| `imagemArquivo` | `String \| null` | Não | `null` | Caminho relativo em `server/uploads/` (`scans/<userId>/<logId>.jpg`) |
| `imagemDemo` | `String \| null` | Não | `null` | Nome de arquivo estático de demonstração (quando `seed: true`) |
| `intoleranciaDetectada` | `Array<String>` | Sim | `[]` | Rótulos legíveis das intolerâncias acionadas (ex: `["Glúten", "Lactose"]`) |
| `nivelSensibilidade` | `'Leve' \| 'Moderado' \| 'Grave'` | Sim | `'Moderado'` | Nível de sensibilidade ativo na avaliação |
| `confiancaOcr` | `Number \| null` | Não (`0..100`) | `null` | Confiança média (0 a 100) reportada pelo motor de OCR |
| `motorOcr` | `String` | Sim (`maxlength: 40`) | `'tesseract'` | Identificador do motor de OCR utilizado |
| `textoBruto` | `String` | Sim | `''` | Texto integral extraído pelo OCR |
| `veredito` | `'SEGURO' \| 'PERIGOSO'` | Sim | — | Resultado final para o perfil do usuário no momento da leitura |
| `alergicosDetectados` | `Array<AlergicoDetectado>` | Sim | `[]` | `{ categoria, tipo: 'CONTEM'\|'TRACOS', termo, trecho, aproximado, termos }` |
| `ingredientesDetalhados` | `Array<{ nome, risco, fonte }>` | Sim | `[]` | Ingredientes individuais extraídos, com itens de risco no topo |
| `curtido` | `Boolean` | Sim | `false` | Indica se o produto está nos favoritos ("Itens Curtidos") |
| `seed` | `Boolean` | Sim | `false` | `true` apenas para registros inseridos via `seed-demo.js` |
| `createdAt` | `Date` | Sim | Auto | Data/hora do escaneamento |
| `updatedAt` | `Date` | Sim | Auto | Data/hora da última atualização |

#### Índices de `scanlogs`
1. `{ userId: 1, createdAt: -1 }` — listagem cronológica do histórico por usuário.
2. `{ userId: 1, curtido: 1, createdAt: -1 }` — listagem rápida da aba de favoritos ("Itens Curtidos").

---

### 2.3 `allergendictionaries` (Model `AllergenDictionary`)

Dicionário central de sinônimos, derivados químicos e exceções seguras para cada categoria de alérgeno.

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | `ObjectId` | Sim | Identificador único |
| `categoria` | `'gluten' \| 'lactose' \| 'amendoim'` | Sim (`unique`) | Chave canônica da intolerância |
| `sinonimos` | `Array<String>` | Sim | Termos e derivados buscados pelo motor de OCR |
| `excecoes` | `Array<String>` | Sim | Falsos amigos que não acionam o alérgeno (ex.: `"leite de coco"`, `"trigo sarraceno"`) |
| `createdAt` | `Date` | Sim | Data de criação |
| `updatedAt` | `Date` | Sim | Data da última atualização |

---

### 2.4 `feedbacks` (Model `Feedback`)

Sugestões, problemas e elogios enviados pelos usuários do aplicativo.

| Campo | Tipo | Obrigatório | Padrão | Descrição |
|---|---|---|---|---|
| `_id` | `ObjectId` | Sim | Auto | Identificador único |
| `userId` | `ObjectId` | Sim (`index`) | — | Referência (`ref: 'User'`) ao autor do feedback |
| `mensagem` | `String` | Sim (`3..1000` chars) | — | Conteúdo enviado (`trim`) |
| `tipo` | `'SUGESTAO' \| 'PROBLEMA' \| 'ELOGIO' \| 'OUTRO'` | Sim | `'OUTRO'` | Categoria do feedback |
| `plataforma` | `'android' \| 'ios' \| 'web'` | Sim | `'web'` | Plataforma de origem |
| `appVersao` | `String` | Não (`maxlength: 30`) | `'1.0.0'` | Versão do aplicativo |
| `createdAt` | `Date` | Sim | Auto | Data/hora do envio |
| `updatedAt` | `Date` | Sim | Auto | Data/hora de atualização |

---

## 3. Regras de Vínculo Nutricionista ↔ Paciente e Visibilidade

1. **Geração do Código (`codigoVinculo`)**:
   - Gerado automaticamente no cadastro do nutricionista (`POST /auth/register-nutricionista`) com 8 caracteres do alfabeto `'ABCDEFGHJKMNPQRSTUVWXYZ23456789'` (sem `I`, `L`, `O`, `0`, `1`).
   - Armazenado no banco em maiúsculas sem hífen (`ABCD2345`) e exibido na interface com máscara `XXXX-XXXX` (`ABCD-2345`).
   - Regenerar o código (`POST /nutri/codigo/regenerar`) altera apenas o `codigoVinculo` para novos convites, **sem desvincular** os pacientes que já apontam para `nutricionistaId`.
2. **Regra de Privacidade e Visibilidade Temporal (`FILTRAR_HISTORICO_DESDE_VINCULO = true`)**:
   - O nutricionista **somente visualiza** os escaneamentos realizados pelo paciente **a partir da data/hora do vínculo** (`ScanLog.createdAt >= paciente.vinculadoEm`).
   - Escaneamentos anteriores ao vínculo permanecem privados para o paciente e não aparecem em `GET /nutri/pacientes`, `GET /nutri/pacientes/:id/historico` nem em `GET /nutri/pacientes/:id/historico/:logId/imagem`.
   - Caso o painel Web consulte diretamente o MongoDB via Mongoose/Driver, **deve sempre aplicar o filtro**:
     ```js
     const filtroScansPaciente = {
       userId: paciente._id,
       ...(paciente.vinculadoEm ? { createdAt: { $gte: paciente.vinculadoEm } } : {}),
     };
     ```
3. **Atualização de Restrições pelo Nutricionista**:
   - Ao alterar as restrições ou níveis de sensibilidade de um paciente (`PUT /nutri/pacientes/:id/restricoes` ou via Web), grava-se:
     - `restricoesAtualizadasPor: 'NUTRICIONISTA'`
     - `restricoesAtualizadasEm: new Date()`
   - Quando o paciente abre a Home no aplicativo mobile e `restricoesAtualizadasEm` é mais recente que `@restricoes_vistas_em`, o app exibe um banner avisando: *"Seu nutricionista atualizou suas restrições"*.
4. **Exclusão de Conta (`DELETE /users/me`)**:
   - **Paciente**: remove permanentemente seus `scanlogs`, `feedbacks`, `helpquestions`, pasta de imagens (`server/uploads/scans/<userId>`) e o documento em `users`.
   - **Nutricionista**: **não apaga** nenhuma conta de paciente; limpa `nutricionistaId: null, vinculadoEm: null, consentimentoVinculoEm: null` de todos os pacientes vinculados antes de remover o documento do nutricionista.
