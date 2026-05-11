# V4 — Imagens aplicadas corretamente por seção

Nesta versão eu corrigi a falha da V3: as imagens não são mais recortes de screenshots/folhas de preview e não foram colocadas de forma aleatória.

## O que foi corrigido

- Hero em 21:9, gerado/exportado em **3840×1646** para uso full-bleed.
- Mega menu em **5:4**, que é o formato real do card do header (`aspect-[5/4]`).
- Categorias e coleções em **3:4**.
- Lookbook e produtos em **4:5**.
- Banners em formato largo, com resolução alta para CTA e seções editoriais.
- Qualidade dos assets salva em JPEG 95, progressive, sem subsampling agressivo.
- `HeroSection` agora usa `quality={95}` e `object-position` por slide para preservar o foco certo no hero.
- `next.config.mjs` aceita `qualities: [75, 80, 85, 95]`.
- Imagens estratégicas das seções também usam `quality={95}`.

## Mapeamento principal

### Hero
- `/public/hero/hero-main.jpg` — duas modelos, vermelho/charcoal, formato hero 21:9.
- `/public/hero/hero-oversized.jpg` — casal em tons neutros, formato hero 21:9.
- `/public/hero/hero-pronta-entrega.jpg` — casal em tons rosé/off-white, formato hero 21:9.

### Mega menu/header
- `/public/menu/mega-camisetas.jpg` — card editorial 5:4.
- `/public/menu/mega-oversized.jpg` — card editorial 5:4.
- `/public/menu/mega-baby-look.jpg` — card editorial 5:4.
- `/public/menu/mega-colecoes.jpg` — card editorial 5:4.
- `/public/menu/mega-promocoes.jpg` — card editorial 5:4.
- `/public/menu/mega-pronta-entrega.jpg` — card editorial 5:4.

### Categorias
- `/public/categories/*.jpg` em 3:4.

### Lookbook
- `/public/lookbook/*.jpg` em 4:5.

### Coleções
- `/public/collections/*.jpg` em 3:4.

### Produtos fallback
- `/public/products/mock-*.jpg` em 4:5.

## Observação

Esta versão prioriza encaixe correto, composição e qualidade para o layout atual. Não mistura mais prints do design como se fossem fotos finais.
