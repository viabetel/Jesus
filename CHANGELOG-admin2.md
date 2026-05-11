# Fashion Store — Admin 2.0 Completo (Lotes 1-4)

## Validação
```
npm run typecheck  ✓ sem erros
npm run lint       ✓ 0 errors, 20 warnings
npm run build      ✓ todas as rotas
```

## Modelo final

```
Produto base (nome, slug, SKU base, categoria, preço)
  → Cores (Preto, Azul, Branco...)
    → Tamanhos (P, M, G, GG) — grade inteligente
    → SKUs automáticos (PRODUTO-COR-TAMANHO)
    → Estoque por célula (cadastrado/reservado/consumido/disponível)
  → Mídia por cor
    → Geral (fallback pra qualquer cor sem mídia)
    → Por cor (cover, hover, galeria, vídeo)
  → Conteúdo da peça (composição, modelagem, cuidados, guia de medidas)
  → Checklist de publicação (13 obrigatórios + 4 opcionais)
```

---

## Lote 1 — Banco + Types + Services + APIs

### Migration 006: mídia por cor
- `color_key`, `color_name`, `color_hex`, `variant_sku` em product_media
- Índices por cor, por variante, por role+cor
- Constraints: uma cover e uma hover por produto+cor

### Media repo v2
- `getProductMediaByColor(productId, colorKey)`
- `getDisplayMedia(productId, selectedColorKey)` — prioridade: cor → geral → tudo
- `getMediaColorKeys(productId)` — lista cores com mídia
- Todas as funções aceitam campos de cor
- Validação unicidade cover/hover por cor

### APIs atualizadas
- GET com `?color=preto` filtra
- POST/PATCH aceitam `colorKey/colorName/colorHex/variantSku`
- Drive import aceita cor

---

## Lote 2 — Admin UI (grade + abas)

### Editor em 6 abas
- Básico: nome, slug, SKU, categoria, status, tags, descrição
- Comercial: preço, promo, badges, flags
- Variações: grade inteligente cor × tamanho
- Mídia: MediaManager por cor
- Conteúdo: composição, modelagem, cuidados, guia de medidas com preview
- Publicação: checklist, ações (publicar/rascunho/ocultar)

### Grade inteligente cor × tamanho
- Adicionar cor → cria P/M/G/GG de uma vez
- Estoque por célula (onBlur salva)
- SKUs automáticos
- Copiar grade, zerar estoque, excluir cor
- Visual: normal/reservado/esgotado

---

## Lote 3 — Mídia por cor + público

### MediaManager v2 por cor
- Grupos visuais: Geral + uma seção por cor
- Upload com seleção de cor ("Enviar para: Preto")
- Alertas: "Sem capa" / "Sem mídia" por cor
- Drag-drop dentro do mesmo grupo

### ProductGallery pública por cor
- Selecionar Preto → mostra fotos pretas
- Selecionar Azul → mostra fotos azuis
- Se cor não tem mídia → fallback pra geral → fallback pra images[]
- Nunca mostra fotos de outra cor

### ProductCard com cover da cor padrão
- enrichProduct busca cover da primeira cor ativa → geral → qualquer

---

## Lote 4 — Checklist + categorias + duplicar + listagem

### Checklist de publicação v2 (para roupa)
13 checks obrigatórios:
- Nome, slug, SKU, categoria, descrição
- Preço válido, preço promo coerente
- Cor ativa, variante ativa, variante com estoque
- SKUs sem duplicata, sem cor+tamanho duplicado
- Imagem de capa (cover)

4 checks opcionais:
- Composição, modelagem, cuidados, guia de medidas

### Categorias vs flags comerciais
- Categorias reais: Camisetas, Oversized, Baby Look, Moletons, Acessórios
- "Promoções" e "Lançamentos" → flags comerciais (isPromotion, isNew), não categorias
- Categories section atualizada na home

### Duplicar produto
- `POST /api/admin/products/[id]/duplicate`
- Copia básico, conteúdo, variantes (com ou sem estoque)
- Gera novo slug e SKU
- Salva como rascunho

### Listagem admin melhorada
- Filtros extras: sem capa, sem estoque, promoção, lançamento
- Botão duplicar por produto
- 9 opções de filtro no select

---

## Setup completo

```sql
-- No Supabase SQL Editor, rodar na ordem:
-- 1. supabase/migrations/001_orders.sql
-- 2. supabase/migrations/002_products.sql
-- 3. supabase/migrations/003_storage.sql
-- 4. supabase/migrations/004_media.sql
-- 5. supabase/migrations/005_product_clothing_fields.sql
-- 6. supabase/migrations/006_media_by_color.sql  ← NOVA
```

## Arquivos novos (todos os lotes)
- `supabase/migrations/006_media_by_color.sql`
- `app/admin/produtos/tabs/tab-variants.tsx`
- `app/api/admin/products/[id]/duplicate/route.ts`

## Arquivos alterados (todos os lotes)
- `lib/services/media-repo.ts` — reescrito (v2 com cor)
- `lib/services/publish-checklist.ts` — reescrito (v2 para roupa)
- `lib/services/public-catalog.ts` — enrichProduct por cor padrão
- `lib/services/drive-import.ts` — aceita cor
- `lib/data/products.ts` — categorias reais, tipo atualizado
- `components/admin/media-manager.tsx` — reescrito (grupos por cor)
- `components/home/categories-section.tsx` — categorias reais
- `app/admin/produtos/product-form.tsx` — reescrito (abas + grade)
- `app/admin/produtos/page.tsx` — filtros extras, duplicar
- `app/produto/[slug]/page.tsx` — carrega product_media
- `components/products/product-details.tsx` — galeria por cor
- `app/api/admin/products/[id]/media/route.ts` — GET com cor
- `app/api/admin/products/[id]/media/[mediaId]/route.ts` — PATCH com cor
- `app/api/admin/products/[id]/drive-import/route.ts` — aceita cor
