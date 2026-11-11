# Tela de Receitas — RotuScan

Foi adicionada a tela `mobile/app/receitas.tsx`, acessível pelo menu lateral em **Receitas**.

## Funcionalidades
- Busca por nome ou categoria da receita.
- Filtros por receitas sem glúten e sem lactose.
- Grade de cartões em duas colunas com imagem, tempo de preparo e indicação alimentar.
- Favoritar/desfavoritar receitas, com persistência local via AsyncStorage (`@rotuscan_receitas_favoritas`).
- Modal de detalhes com descrição, ingredientes e modo de preparo.
- Aviso para conferir rótulos e risco de contaminação cruzada.

## Como testar
1. Entre na pasta `mobile`.
2. Execute `npm install` (se ainda não instalou as dependências).
3. Execute `npx expo start`.
4. Faça login e abra o menu lateral (ícone de três linhas).
5. Selecione **Receitas**.
6. Teste a busca, os filtros, o coração de favoritos e toque em um cartão para abrir os detalhes.

## Observações
- Nesta primeira versão, as seis receitas são dados locais de demonstração no próprio arquivo `receitas.tsx`; não há endpoint de receitas no backend original.
- As fotografias são carregadas de URLs públicas do Unsplash, portanto precisam de conexão com a internet.
- As classificações alimentares são informativas e não substituem a conferência dos rótulos dos ingredientes nem a avaliação de contaminação cruzada.
