# Fashion Store — v18 (em cima da v16)

## Foco: operação real da loja (não design)

Esta rodada corrige 7 pontos estruturais que impediam operação real.

## Validação local
```
npm run typecheck  ✓ sem erros
npm run lint       ✓ 0 errors, 18 warnings
npm run build      ✓ todas as rotas geradas
```

## Validação em runtime (curl contra `next start` em produção)

| Teste | Resultado |
|---|---|
| Cart validate: produto existente | nome, preço, estoque, variante retornados ✓ |
| Cart validate: produto fake | `shouldRemove: true`, warning claro ✓ |
| Stock sem auth | 401 ✓ |
| Stock com auth | 8 variantes com stock/reserved/consumed/available ✓ |
| Checkout sem Supabase (prod) | Erro claro: "não cria pedido sem banco em produção" ✓ |

## ✅ O que foi corrigido

### 1. CartContext refatorado — salva só refs
**Antes:** `CartItem` salvava `Product` inteiro no localStorage (preço, estoque, imagem stale).

**Agora:** localStorage armazena `{ productId, variantSku, quantity }[]`. Ao carregar:
- Chama `POST /api/cart/validate` que retorna dados atuais de cada item
- Se o produto sumiu/foi desativado: `shouldRemove: true` + warning claro
- Se estoque insuficiente: quantidade auto-ajustada
- Se preço mudou: flag `priceChanged`
- Migração automática do formato antigo (v1 → v2)

### 2. API `/api/cart/validate` (pública)
Recebe `{ items: [{ productId, variantSku, quantity }] }`. Retorna:
- Dados atuais do produto (nome, preço, imagem, status)
- Variante atual (cor, tamanho, ativa)
- Estoque disponível (considerando reservas)
- Warnings e flag `shouldRemove`

### 3. Revalidação antes do checkout
`cart-content.tsx` chama `revalidate()` antes de criar pedido:
- Se algum item mudou/esgotou, mostra toast e aborta
- Se tudo ok, procede com o POST
- O checkout não envia price/total — servidor recalcula

### 4. Fallback in-memory seguro
**Antes:** fallback in-memory podia rodar em produção silenciosamente.

**Agora:**
- `lib/env.ts` exporta `isProduction()` e `canUseMemoryFallback()`
- Leitura (catálogo público) sempre funciona via array legado — nunca quebra
- Escrita (criar pedido, editar produto) retorna `503 NO_DB` com mensagem clara
- Módulos não lançam durante import/init — erros são tipados e tratados
- `lib/supabase.ts` simplificado: `getSupabase()` nunca lança, escrita usa `tryGetSb()` que retorna `RepoResult`

### 5. Estoque detalhado no admin
`GET /api/admin/products/[id]/stock` retorna por variante:
- `stock` (cadastrado)
- `reserved` (pedidos recebidos/confirmados)
- `consumed` (pedidos entregues)
- `available` (stock - reserved - consumed)

Helper: `lib/services/stock-balance.ts` com `getStockBalance` e `getProductStockBalances`.

### 6. Composição/cuidados no banco
**Antes:** hardcoded na página do produto ("100% algodão premium", "Lavar à máquina 30°C", tabela de medidas fixa).

**Agora:**
- Tipo `Product` tem campos: `composition`, `fit`, `care: string[]`, `sizeGuide: { size, width, length }[]`
- Schema migration: `supabase/migration-composition.sql`
- Admin permite editar: composição (campo texto), modelagem (texto), cuidados (um por linha), guia de medidas (CSV simples: TAM, LARGURA, COMPRIMENTO)
- Página do produto lê do produto; se vazio, mostra fallback genérico
- `products-repo.ts` mapeia `care` como `string[]` e `size_guide` como JSON array

### 7. Checklist de publicação
`lib/services/publish-checklist.ts`:
- `getPublishChecklist(product)` retorna lista de checks com label/passed/required
- Obrigatórios: nome, slug, SKU, preço, categoria, descrição, imagem cover, variante ativa, variante com estoque
- Opcionais: composição, cuidados (informam mas não bloqueiam)
- `canPublish(product)`: all required checks passed
- `getMissingRequirements(product)`: lista de labels faltando

**Validação no servidor:** `updateProduct` impede `status=ativo` se checklist falhar. Retorna `code: "INCOMPLETE"` com lista do que falta.

**UI no admin:** seção "Checklist de publicação" no formulário do produto com todos os checks visuais (verde/vermelho/cinza pra opcionais).

## Arquivos novos
- `app/api/cart/validate/route.ts`
- `app/api/admin/products/[id]/stock/route.ts`
- `lib/env.ts`
- `lib/services/stock-balance.ts`
- `lib/services/publish-checklist.ts`
- `supabase/migration-composition.sql`

## Arquivos alterados
- `contexts/cart-context.tsx` — reescrito (refs + hidratação)
- `components/cart/cart-content.tsx` — reescrito (usa HydratedCartItem)
- `components/products/product-details.tsx` — addItem novo, composição/cuidados/guia dinâmicos
- `lib/data/products.ts` — tipos care/sizeGuide
- `lib/services/products-repo.ts` — mapeia care/sizeGuide, checklist no updateProduct, sem getSupabaseOrFail
- `lib/supabase.ts` — simplificado (sem import circular, sem lançar em init)
- `app/admin/produtos/product-form.tsx` — campos novos, checklist visual, sizeGuide
- `app/produto/[slug]/page.tsx` — sem generateStaticParams (force-dynamic)
- `next.config.mjs` — NEXT_PHASE env

## Setup
1. Rode `supabase/migration-composition.sql` no SQL Editor
2. Sem mais passos — o resto é código

## O que NÃO entrou
- Display de reservado/disponível inline na tabela de variantes do admin (API está pronta, falta integrar na UI)
- Sacola mostrando "preço foi atualizado desde que você adicionou"
- Migração automática do formato old cart em todos os browsers
