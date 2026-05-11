# Transplante FASHION — Imagens das seções (V3)

Atualização feita por ChatGPT.

## Objetivo
Usar nas seções do storefront as imagens que vieram dentro do `FASHION.zip`, em vez de deixar os cards caindo apenas em gradients/placeholders.

## O que foi feito

### Assets gerados a partir do FASHION.zip
Foram extraídas/cortadas imagens do ZIP original para popular:

- `public/hero/hero-main.jpg`
- `public/hero/hero-oversized.jpg`
- `public/hero/hero-pronta-entrega.jpg`
- `public/categories/camisetas.jpg`
- `public/categories/oversized.jpg`
- `public/categories/baby-look.jpg`
- `public/categories/lancamentos.jpg`
- `public/categories/promocoes.jpg`
- `public/categories/pronta-entrega.jpg`
- `public/banners/drop-semana.jpg`
- `public/banners/pronta-entrega.jpg`
- `public/banners/guia-medidas.jpg`
- `public/lookbook/look-oversized.jpg`
- `public/lookbook/look-camiseta.jpg`
- `public/lookbook/look-baby-look.jpg`
- `public/collections/fe-urbana.jpg`
- `public/collections/essenciais.jpg`
- `public/collections/para-presentear.jpg`
- `public/collections/dia-a-dia.jpg`
- `public/menu/mega-camisetas.jpg`
- `public/menu/mega-oversized.jpg`
- `public/menu/mega-baby-look.jpg`
- `public/menu/mega-colecoes.jpg`
- `public/menu/mega-promocoes.jpg`
- `public/menu/mega-pronta-entrega.jpg`
- `public/products/mock-*.jpg`

### Componentes atualizados

- `components/home/hero-section.tsx`
  - Agora os 3 slides usam imagens diferentes:
    - `/hero/hero-main.jpg`
    - `/hero/hero-oversized.jpg`
    - `/hero/hero-pronta-entrega.jpg`

- `components/home/categories-section.tsx`
  - Já apontava para `/categories/*.jpg`; agora os arquivos existem.

- `components/home/pronta-entrega-band.tsx`
  - Usa imagens reais em `/banners/pronta-entrega.jpg` e `/banners/drop-semana.jpg`.

- `components/home/collections-section.tsx`
  - Deixou de repetir `/hero/hero-main.jpg` em todos os cards.
  - Agora usa `/collections/*.jpg`.

- `components/home/lookbook-section.tsx`
  - Já apontava para `/lookbook/*.jpg`; agora os arquivos existem.

- `components/home/final-cta-section.tsx`
  - Usa `/banners/drop-semana.jpg`.

- `components/fashion/Header.tsx`
  - Mega menu visual agora usa `/menu/mega-*.jpg`.

- `components/fashion/data-adapter.ts`
  - Mock/fallback products agora usam imagens em `/products/mock-*.jpg` em vez de repetir o hero.

## Observação importante
Algumas imagens do `FASHION.zip` eram screenshots/referências do design original. Por isso, estes assets devem ser tratados como imagens temporárias de composição visual. O ideal final ainda é substituir por fotos/gerações próprias da Fashion Store, sem marcas ou textos de referência.
