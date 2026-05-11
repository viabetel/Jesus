# Fashion Store — Admin 2.0 Lote 1 (fundação banco + types + services + APIs)

## O que este lote entrega

A fundação de dados e serviços para mídia por cor. Tudo que os Lotes 2 (admin UI)
e 3 (público + checklist) vão consumir.

### Nada quebrou. Tudo é backward-compatible.
Mídia existente sem `color_key` continua funcionando exatamente como antes.
Os novos campos são todos nullable e opcionais.

## Validação
```
npm run typecheck  ✓ sem erros
npm run lint       ✓ 0 errors, 19 warnings
npm run build      ✓ todas as rotas
```

---

## 1. Migration 006: Mídia por cor

`supabase/migrations/006_media_by_color.sql`

Novos campos em `product_media`:
- `color_key text` — slug da cor (ex: "preto"). NULL = mídia geral.
- `color_name text` — nome legível (ex: "Preto").
- `color_hex text` — hex (ex: "#000000").
- `variant_sku text` — SKU de variante específica (raro, opcional).

Índices:
- `product_media_product_color_idx` — (product_id, color_key)
- `product_media_variant_sku_idx` — (product_id, variant_sku) WHERE NOT NULL
- `product_media_role_color_idx` — (product_id, role, color_key)

Constraints de unicidade parcial:
- **Uma cover por produto+cor** — `UNIQUE(product_id, COALESCE(color_key, '__general__')) WHERE role='cover'`
- **Uma hover por produto+cor** — idem com hover

Isso garante no banco que não existem duas covers pra mesma cor.

## 2. Migrações organizadas

`supabase/migrations/` com numeração clara:
```
001_orders.sql
002_products.sql
003_storage.sql
004_media.sql
005_product_clothing_fields.sql
006_media_by_color.sql       ← NOVA
```

## 3. Types atualizados

`ProductMedia` agora tem:
```typescript
colorKey: string | null
colorName: string | null
colorHex: string | null
variantSku: string | null
```

`MediaInput` aceita esses campos.
`MediaPatch` aceita esses campos.

## 4. Media repo v2

`lib/services/media-repo.ts` — reescrito completo:

Funções novas:
- `getProductMediaByColor(productId, colorKey)` — filtra por cor
- `getDisplayMedia(productId, selectedColorKey)` — prioridade: cor selecionada → geral → tudo
- `getMediaColorKeys(productId)` — lista cores que têm mídia

Funções atualizadas (todas aceitam campos de cor):
- `getProductMedia` — retorna tudo incluindo campos de cor
- `addMedia` — aceita colorKey/colorName/colorHex/variantSku
- `updateMedia` — aceita patch desses campos
- `reorderMedia` — funciona por grupo (mesma cor)
- `migrateImagesToMedia` — migra como mídia geral (colorKey=null)

Validação de unicidade cover/hover:
- Antes de inserir cover/hover, verifica se já existe um pra aquela cor
- Se existir, desmarca o anterior (muda pra gallery) automaticamente

## 5. APIs atualizadas

`GET /api/admin/products/[id]/media`
- Sem query: retorna tudo
- `?color=preto`: filtra por cor
- `?color=__general__`: só mídia geral

`POST /api/admin/products/[id]/media`
- body agora aceita: `colorKey, colorName, colorHex, variantSku`

`PATCH /api/admin/products/[id]/media/[mediaId]`
- patch agora aceita: `colorKey, colorName, colorHex, variantSku`

`POST /api/admin/products/[id]/drive-import`
- body agora aceita: `colorKey, colorName, colorHex`
- toda mídia importada fica vinculada àquela cor

## 6. Público (backward-compatible)

`public-catalog.ts` atualizado pra mapear os novos campos.
O `enrichProduct` continua buscando cover/hover geral — comportamento idêntico ao antes.
Na Lote 3 vai ser atualizado pra buscar por cor.

---

## Setup pra ativar

```sql
-- No Supabase SQL Editor, rode APENAS este arquivo:
-- supabase/migrations/006_media_by_color.sql
--
-- Os migrations 001-005 já foram rodados em rodadas anteriores.
-- Este é incremental.
```

## Próximos lotes

**Lote 2:** Admin UI
- Grade inteligente cor × tamanho
- MediaManager por cor (grupos)
- Editor em abas
- Estoque real na grade

**Lote 3:** Público + Checklist
- ProductGallery por cor
- ProductCard com cover por cor
- Checklist de publicação pra roupa
- Categorias vs coleções

## Arquivos novos
- `supabase/migrations/006_media_by_color.sql`
- `supabase/migrations/001_orders.sql` (cópia organizada)
- `supabase/migrations/002_products.sql` (cópia organizada)
- `supabase/migrations/003_storage.sql` (cópia organizada)
- `supabase/migrations/004_media.sql` (cópia organizada)
- `supabase/migrations/005_product_clothing_fields.sql` (cópia organizada)

## Arquivos alterados
- `lib/services/media-repo.ts` — reescrito completo (v2 com cor)
- `lib/services/drive-import.ts` — aceita colorKey/colorName/colorHex
- `lib/services/public-catalog.ts` — mapeia novos campos
- `app/api/admin/products/[id]/media/route.ts` — GET com ?color, POST com campos de cor
- `app/api/admin/products/[id]/media/[mediaId]/route.ts` — PATCH com campos de cor
- `app/api/admin/products/[id]/drive-import/route.ts` — aceita cor
