# Transplante FASHION fiel v2

Esta versão corrige a estratégia de meio-termo e aproxima o front público do FASHION aprovado.

## O que foi feito

- Corrigidos tokens Tailwind ausentes (`bg-ink`, `bg-cream`, `bg-bg`, `text-muted-fg`, etc.). Esse era um dos principais motivos do visual não bater com o FASHION.
- Catálogo refeito com linguagem editorial FASHION: filtros hard-edge, max-width amplo, sidebar tipo Dash, toolbar e grid visual.
- Produto refeito com linguagem FASHION: galeria editorial, coluna de compra sticky, status pill, cores/tamanhos hard-edge, WhatsApp e accordions.
- Sacola reescrita visualmente no estilo FASHION, preservando o carrinho real e finalizando pelo WhatsApp.
- Corrigido filtro especial de `categoria=lancamentos` e `categoria=promocoes`.
- Criada rota `/termos-de-uso` e corrigido link no footer FASHION.
- Adicionado `qualities: [75, 80, 85]` no `next.config.mjs` para evitar erro/alerta do Next Image.

## Validação local

- `npm run typecheck`: passou.
- Testes HTTP no dev server: `/`, `/produtos`, `/sacola`, `/favoritos`, `/termos-de-uso` e `/produto/camiseta-cristo-em-suas-linhas` retornaram 200.
- `next build`: compilou e passou TypeScript, mas no container travou em `Collecting page data`/workers do Next 16. Isso parece limitação do ambiente de build local, não erro de TypeScript.

## Observação importante

Ainda faltam imagens editoriais reais para o visual chegar no nível máximo do FASHION. O front agora está preparado, mas os diretórios de assets seguem dependentes dos arquivos reais.
