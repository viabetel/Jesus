# CHANGELOG — Fashion Store

## v8 (reconstrução em cima da v6 base)

### Mídia / Vídeo

- **`lib/data/media.ts`** — Sistema de mídia v2
  - Tipos: `MediaItem`, `ProductMedia`, `MediaProvider`, `MediaRole`
  - `sourceProvider`: `drive | cloudinary | blob | local | external`
  - `optimizedUrl`, `thumbnailUrl`, `posterUrl` por item
  - `detectProvider()` — detecta provider pela URL
  - `extractDriveId()` — extrai ID do Drive de qualquer formato de URL
  - `resolvePublicVideoSrc()` — retorna URL de vídeo para `<video src>`
  - `resolveVideoPoster()` — retorna poster/thumbnail do vídeo
  - `recommendedLocalPath()` — sugere path local para migração futura
  - `buildMediaFromLegacy()` — backward-compat com `images[]` + `video?`
  - `buildGalleryEntries()` — monta galeria ordenada (cover → video → hover → gallery)

- **`components/products/product-video-player.tsx`** — Player próprio
  - `<video>` nativo, sem iframe do Drive
  - `controlsList="nodownload noplaybackrate noremoteplayback"`
  - `disablePictureInPicture`, `playsInline`
  - Autoplay muted com loop
  - Poster automático
  - Toggle de áudio (botão flutuante)
  - Fallback amigável se vídeo não carregar
  - Overlay de play se autoplay bloqueado

- **`components/products/product-gallery.tsx`** — Galeria reescrita
  - Usa player próprio no lugar do iframe
  - Imagem mobile: `min-h-[320px] max-h-[58dvh] sm:max-h-[60dvh] lg:max-h-[640px]`
  - `object-contain` na imagem principal (não corta a camiseta)
  - Fundo `bg-[#f6f2ea]`
  - Lightbox fullscreen com navegação
  - Botão "ver em tela cheia"
  - Thumbs com badge de vídeo
  - Dots de navegação + setas + contador

- **`components/products/product-details.tsx`** — Refatorado
  - Galeria extraída para componente separado `ProductGallery`
  - Removido código de iframe/Drive inline

### Admin protegido

- **`middleware.ts`**
  - Redireciona `/admin/*` para `/admin/login` se cookie `fs_admin` ausente
  - Senha via `ADMIN_PASSWORD` (env)
  - Sem env → acesso liberado + header `x-admin-unprotected`

- **`app/api/admin/login/route.ts`**
  - POST: valida senha, seta cookie httpOnly (8h)

- **`app/api/admin/logout/route.ts`**
  - POST: limpa cookie

- **`app/admin/login/page.tsx`**
  - Tela escura, formulário com toggle de visibilidade, validação, redirect

- **`app/admin/page.tsx`** — Hub
  - 4 módulos: Mídia, Catálogo & Validações, Importação Drive (preview), Produtos & Variantes (em projeto)
  - Banner amarelo se `ADMIN_PASSWORD` não configurado
  - Botão logout

- **`app/admin/midias/page.tsx`** — Admin de mídia
  - Lista de produtos com busca
  - Paginação (6/página)
  - Collapse expansível por produto
  - Grid de thumbs com badge de provider
  - Botão Copiar URL
  - Botão abrir mídia/produto
  - Alertas: sem capa, sem hover, sem vídeo
  - Logout no header

- **`app/admin/catalogo/page.tsx`** — Validações
  - Roda `validateCatalog()` na abertura
  - Sumário visual: total, erros, avisos, infos
  - Lista agrupada por severidade
  - Link para produto na loja
  - Código da issue para debug

- **`app/admin/drive/page.tsx`** — Importação Drive (preview)
  - UI completa do fluxo: selecionar produto → ID da pasta → listar → atribuir papéis
  - Banner informando que integração real virá na próxima versão
  - Slots visuais para cada role de mídia

### Variants e validação

- **`lib/data/variants.ts`**
  - `ProductVariant` com `colorName`, `colorHex`, `size`, `stock`, `sku`, `active`
  - `getProductVariants()` — deriva matriz cor × tamanho do stock total (backward-compat)
  - `getVariantStock()` — estoque por cor + tamanho
  - `getAvailableSizes()` — tamanhos disponíveis (opcionalmente por cor)
  - `getAvailableColors()` — cores disponíveis (opcionalmente por tamanho)
  - `getTotalStock()` — soma total

- **`lib/data/catalog-validation.ts`**
  - `validateProduct()` — slug, preço, imagens, vídeo, estoque, tamanhos, cores, descrição
  - `validateCatalog()` — valida todos + detecta slug duplicado + imagem repetida
  - Retorna `{ issues, summary }`

### Catálogo público

- **`components/products/products-content.tsx`**
  - Paginação client-side (24/página)
  - Reset de página ao mudar filtros
  - Controles de paginação com botões numéricos
  - Scroll to top ao mudar página

### Técnico

- **`next.config.mjs`**
  - Removido `ignoreBuildErrors: true`
  - Adicionado `drive.google.com` em `remotePatterns`

- **`package.json`**
  - Script `typecheck: tsc --noEmit`
  - Script `lint: next lint`
  - `eslint` + `eslint-config-next` em devDependencies

- **`.eslintrc.json`** — config mínima `next/core-web-vitals`

- **`.env.example`** — documenta `ADMIN_PASSWORD`, `GOOGLE_DRIVE_API_KEY`, `CLOUDINARY_URL`, `BLOB_READ_WRITE_TOKEN`

---

### O que ficou para a próxima rodada

1. **Integração real com API do Google Drive** — listar pastas, importar mídia
2. **Upload para Cloudinary / Vercel Blob** — botão no admin para migrar mídia do Drive
3. **Admin de Produtos & Variantes** — CRUD completo com variantes reais no banco
4. **Banco de dados** — migrar de `products.ts` para Supabase/Neon/PostgreSQL
5. **ISR / geração sob demanda** — para escalar além de ~300 produtos
6. **NextAuth ou auth mais robusto** — substituir Basic Auth por sessão real
7. **Mux / Cloudflare Stream** — para vídeo com stream adaptativo
