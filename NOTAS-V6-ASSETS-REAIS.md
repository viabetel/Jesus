# V6 — Assets reais da loja aplicados nas seções

Nesta versão, as seções estratégicas da home e do mega menu deixaram de depender de fotos aleatórias/placeholder.

## O que foi feito
- Hero agora usa imagens reais dos produtos já referenciados em `lib/data/products.ts` (Google Drive / acervo original).
- Categorias da home usam fotos reais do catálogo.
- Mega menu usa fotos reais do catálogo.
- Coleções, lookbook e banner de pronta entrega usam fotos reais do catálogo.

## Fonte das imagens
As URLs foram puxadas do próprio dataset do projeto (`lib/data/products.ts`), mantendo coerência com o acervo já usado nos produtos originais.

## Observação
Os slugs internos continuam os mesmos (incluindo `baby-look` como filtro interno temporário), mas a comunicação pública permanece multisex.
