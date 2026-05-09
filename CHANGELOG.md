# Fashion Store — v14 (em cima da v13)

## Foco da rodada
**Rodada 3 do plano "tudo": mídia estruturada com role + drag-drop + Drive importer.**

Trio fechou: rodada 1 (CRUD produtos), rodada 2 (upload), rodada 3 (mídia rica).

## Validação local
```
npm install        ✓
npm run typecheck  ✓ sem erros
npm run lint       ✓ 0 errors, 15 warnings (pré-existentes)
npm run build      ✓ 5 rotas novas listadas
```

## Validação em runtime (curl)

| Cenário | Resposta | OK |
|---|---|---|
| GET media sem auth | 401 | ✓ |
| GET media com auth (sem Supabase) | 200 + lista vazia | ✓ |
| POST add media sem url | 400 mensagem clara | ✓ |
| POST add media sem Supabase | 503 NO_DB | ✓ |
| POST reorder sem array | 400 | ✓ |
| POST drive-import sem chave | 503 NO_DRIVE_KEY | ✓ |
| POST drive-import sem folder | 400 | ✓ |
| GET drive-import (status) | 200 `{configured: false}` | ✓ |

## ✅ O que foi entregue

### 1. Tabela `product_media` no Supabase
`supabase/schema-media.sql` (rodar UMA VEZ no SQL Editor):
- Colunas: id, product_id (FK cascade), url, storage_path, kind (image/video),
  role (cover/hover/front/back/detail/model/lifestyle/gallery/video),
  alt, sort_order, width, height, timestamps
- Trigger pra updated_at automático
- RLS habilitado, policy de leitura pública (catálogo)
- Índices em (product_id, sort_order) e (product_id, role)

### 2. Repository de mídia (`lib/services/media-repo.ts`)
- `getProductMedia(productId)` — lista ordenada
- `addMedia(input)` — adiciona com sort_order automático no fim
- `updateMedia(id, patch)` — atualiza role, sortOrder, alt
- `deleteMedia(id)` — remove
- `reorderMedia(productId, orderedIds[])` — batch update de ordem
- `migrateImagesToMedia(productId, images, video)` — idempotente,
  popula a tabela a partir do array antigo

Todos retornam `RepoResult<T>` com erros tipados (NO_DB, NOT_FOUND, INVALID, DB).

### 3. API routes
- `GET    /api/admin/products/[id]/media` → lista
- `POST   /api/admin/products/[id]/media` → adiciona
- `PATCH  /api/admin/products/[id]/media/[mediaId]` → atualiza role/ordem/alt
- `DELETE /api/admin/products/[id]/media/[mediaId]` → remove + apaga do storage
- `POST   /api/admin/products/[id]/media/reorder` → reordenar batch
- `POST   /api/admin/products/[id]/media/migrate` → migra do array images[]
- `GET    /api/admin/products/[id]/drive-import` → checa se Drive configurado
- `POST   /api/admin/products/[id]/drive-import` → importa pasta do Drive

Todas com auth via cookie `fs_admin`.

### 4. Componente `MediaManager`
`components/admin/media-manager.tsx` — substitui o `MediaUploader` da rodada 2:

**Banner de migração** — se o produto tem `images[]` legado e tabela vazia,
aparece banner amarelo "Migre pra estrutura nova" com botão.

**Drive importer** (sanfona retrátil):
- Campo pra ID/URL da pasta
- Detecta automaticamente se `GOOGLE_DRIVE_API_KEY` está configurada
- Se não, mostra alerta com instrução
- Importa até 30 arquivos por vez, copia pro nosso Storage,
  registra na tabela com role automática (cover/hover/gallery/video)

**Upload de imagens**:
- Drag & drop ou clique
- Múltiplos arquivos de uma vez
- Cada upload já registra na tabela (não precisa salvar produto)

**Grid de imagens**:
- Drag & drop nativo (HTML5) pra reordenar — visual ring verde no destino
- Badge colorido por role (capa verde, hover azul, frente roxo, etc)
- Dropdown pra mudar role (overlay no hover do mouse)
- Botão remover com confirmação (apaga do storage também)
- **Cover e Hover** são únicos: marcar uma imagem como cover desmarca
  qualquer outra que tinha esse role

**Vídeo**: dropzone separado, único arquivo, mesmo fluxo.

### 5. Drive importer (`lib/services/drive-import.ts`)
- `importDriveFolder({ productId, folderInput, limit })`
  - Aceita ID puro ou URL completa do Drive
  - Lista arquivos via Drive API v3 com `key=GOOGLE_DRIVE_API_KEY`
  - Filtra por MIME (image/video permitidos)
  - Faz download via `alt=media`
  - Faz upload pro Supabase Storage (passa pelo `uploadProductMedia`)
  - Registra na tabela `product_media` com role automática
  - Retorna `{ imported, skipped, errors[] }`
- `isDriveConfigured()` checa se a env existe

**Importante:** sem `GOOGLE_DRIVE_API_KEY`, retorna `503 NO_DRIVE_KEY` com
mensagem clara. A pasta do Drive precisa estar pública ou compartilhada com
a chave.

### 6. Página do produto pública agora lê `product_media`
`/produto/[slug]` faz SSR que:
- Carrega o produto via `getProductBySlug`
- Carrega mídia estruturada via `getProductMedia(product.id)`
- Se houver mídia na tabela: monta `images[]` na ordem (cover → hover → resto
  pela `sortOrder`) e passa pro `ProductDetails`
- Se não: usa o `images[]` legado do produto (compat total)

Resultado: editar mídia no admin reflete imediatamente no site.

## Status do projeto

| Frente | Status |
|---|---|
| Vitrine | bom |
| Página produto | usa mídia da tabela |
| Carrinho | bom |
| Pedidos | persistência real (Supabase) |
| Admin produtos | CRUD completo |
| Admin mídia | upload + role + drag-drop + Drive importer |
| Variantes | CRUD inline |
| Estoque | reservas funcionais |
| Drive como CDN | substituído pelo Storage do Supabase ao importar |

## Setup pra ativar

1. Rode `supabase/schema-media.sql` no SQL Editor (depois dos outros 3
   schemas das rodadas anteriores)
2. (Opcional) Pra usar o Drive importer:
   - Console GCP → Library → Google Drive API → habilitar
   - Credentials → Create credentials → API key
   - Vercel → Settings → Environment Variables:
     `GOOGLE_DRIVE_API_KEY=AIzaSy...`
3. Vai em `/admin/produtos/[id]`, na seção Mídia:
   - Se o produto tem imagens legadas, clica "Migrar agora" no banner
   - Faça upload, marque roles, arraste pra reordenar

## Arquivos novos
- `supabase/schema-media.sql`
- `lib/services/media-repo.ts`
- `lib/services/drive-import.ts`
- `app/api/admin/products/[id]/media/route.ts`
- `app/api/admin/products/[id]/media/[mediaId]/route.ts`
- `app/api/admin/products/[id]/media/reorder/route.ts`
- `app/api/admin/products/[id]/media/migrate/route.ts`
- `app/api/admin/products/[id]/drive-import/route.ts`
- `components/admin/media-manager.tsx`

## Arquivos alterados
- `app/admin/produtos/product-form.tsx` — usa MediaManager (substituiu MediaUploader)
- `app/produto/[slug]/page.tsx` — mescla mídia da tabela com produto antes de renderizar
- `lib/data/media.ts` — adicionado `buildGalleryFromDb` e `buildGallerySmart`

## ❌ Não entrou nesta rodada (intencional)

- **Edição de mídia em `/admin/midias`** — continua read-only de auditoria.
  Toda edição acontece em `/admin/produtos/[id]`, que faz mais sentido (mídia
  pertence ao produto, não a um inventário separado).
- **Importer com OAuth pra pastas privadas** — pasta tem que estar pública
  ou compartilhada com a API key. OAuth seria fluxo bem mais complexo.
- **Limpeza de arquivos órfãos** — se você deleta uma mídia da tabela mas o
  storage falha, o arquivo fica. Vale um cron job no futuro.
