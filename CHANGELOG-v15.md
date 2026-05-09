# v15 — Fonte Única da Verdade (Supabase)

## Problema resolvido

O admin salvava dados no Supabase, mas o site público (home, /produtos, checkout, busca) ainda lia do array estático `lib/data/products.ts`.

Resultado: edições no admin não apareciam no site público.

## O que mudou

### 1. Home agora lê do Supabase

`app/page.tsx` virou async server component com `force-dynamic`.
Chama `getAllProducts()` do repositório Supabase e passa dados para cada seção via props.

Seções corrigidas:
- **FeaturedSection** — recebe `products` prop
- **NewArrivalsSection** — recebe `products` prop
- **PromotionsSection** — recebe `products` prop
- **LowStockSection** — recebe `products` prop
- **InstagramSection** — recebe `feedImages` prop

Se você editar produto no admin (marcar isNew, isPromotion, mudar preço, etc.), as mudanças refletem na home.

### 2. /produtos agora lê do Supabase

`app/produtos/page.tsx` virou async com `force-dynamic`.
Chama `getAllProducts()` e passa para `ProductsContent` via prop.

`ProductsContent` não importa mais o array estático. Recebe `products` como prop.
Filtros de tamanho/cor são derivados dos dados reais via `useMemo`.

### 3. Checkout agora valida pelo Supabase

`lib/services/orders.ts` parou de importar `products` do array estático.
Agora usa `getProductById()` do `products-repo.ts` (Supabase).

Se você mudar preço/estoque/status no admin, o checkout usa o valor atualizado.
Se produto foi criado no admin, o checkout encontra e processa.

### 4. Busca agora lê do Supabase

Nova API pública: `GET /api/products`
Retorna produtos ativos com dados mínimos para busca.

`SearchDialog` agora faz fetch dessa API ao abrir, em vez de importar array estático.

### 5. Produtos relacionados lêem do Supabase

`RelatedProducts` recebe `allProducts` prop do slug page.
O slug page já carregava do repo — agora passa também para os relacionados.

### 6. Produto público protege status

`app/produto/[slug]/page.tsx` agora checa `product.status !== "ativo"` e retorna 404.
Produto rascunho/oculto não abre publicamente.

### 7. Admin de mídia lê do Supabase

`app/admin/midias/page.tsx` agora faz fetch de `/api/admin/products` em vez de importar array estático.

## O que NÃO mudou (continua funcionando como antes)

- **Helper functions** (`getProductColors`, `getTotalStock`, etc.) continuam em `products.ts` como utilitários puros — operam sobre um objeto Product passado, não lêem do array.
- **Types** (`Product`, `ProductVariant`, `ProductSize`, etc.) continuam em `products.ts`.
- **categories** e **sizeChart** são dados estáticos de referência, continuam em `products.ts`.
- **Admin CRUD** (`/admin/produtos`) já usava Supabase — sem mudança.
- **Pedidos** (`/admin/pedidos`) já usava Supabase — sem mudança.

## Resumo da fonte de dados agora

| Página/Componente | Antes | Agora |
|---|---|---|
| Home | products.ts | Supabase via getAllProducts() |
| /produtos | products.ts | Supabase via getAllProducts() |
| /produto/[slug] | products-repo | products-repo (já estava) |
| Checkout/orders | products.ts | Supabase via getProductById() |
| SearchDialog | products.ts | /api/products (Supabase) |
| RelatedProducts | products.ts | Props do slug page (Supabase) |
| Admin mídia | products.ts | /api/admin/products (Supabase) |
| ProductCard | Props (sem mudança) | Props (sem mudança) |
| CartContext | getVariantStock (utility) | getVariantStock (utility) |

## products.ts agora serve apenas para:
- Tipos e interfaces
- Funções utilitárias puras
- Seed/migração legada (via /api/admin/migrate)
- Fallback em dev sem Supabase

## Build

```
npm run typecheck → ✓
npm run build → ✓ (35/35 páginas)
```

Home e /produtos agora são `ƒ` (dynamic) — não mais estáticas.
