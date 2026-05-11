-- ============================================================
-- Fashion Store — Migration 006: Mídia por cor
--
-- Adiciona campos de cor na tabela product_media para que cada
-- mídia possa ser vinculada a uma cor específica do produto.
--
-- Regras:
--   - mídia sem color_key = mídia geral do produto
--   - mídia com color_key = mídia daquela cor
--   - variant_sku opcional, para mídia de variante específica
--
-- Rode DEPOIS de 004_media.sql e 005_product_clothing_fields.sql.
-- ============================================================

-- Novos campos
alter table public.product_media
  add column if not exists color_key  text,         -- slug da cor (ex: "preto", "azul-royal")
  add column if not exists color_name text,         -- nome legível (ex: "Preto", "Azul Royal")
  add column if not exists color_hex  text,         -- hex (ex: "#000000")
  add column if not exists variant_sku text;        -- SKU da variante específica (raro, opcional)

-- Comentários
comment on column public.product_media.color_key is 'Slug da cor. NULL = mídia geral do produto.';
comment on column public.product_media.color_name is 'Nome legível da cor.';
comment on column public.product_media.color_hex is 'Cor em hex (#000000).';
comment on column public.product_media.variant_sku is 'SKU de variante específica. Raramente usado.';

-- ===== Índices =====

-- Buscar mídia por produto + cor (principal query da galeria pública)
create index if not exists product_media_product_color_idx
  on public.product_media (product_id, color_key);

-- Buscar mídia por variante (raro mas possível)
create index if not exists product_media_variant_sku_idx
  on public.product_media (product_id, variant_sku)
  where variant_sku is not null;

-- Buscar por role + cor (pra garantir unicidade de cover/hover por cor)
create index if not exists product_media_role_color_idx
  on public.product_media (product_id, role, color_key);

-- ===== Constraint de unicidade parcial =====
-- Garante que só existe UMA cover por produto+cor e UMA hover por produto+cor.
-- Mídia geral (color_key IS NULL): uma cover geral, uma hover geral.
-- Mídia por cor (color_key = 'preto'): uma cover preta, uma hover preta.
--
-- Usamos índices únicos parciais porque unique constraint não funciona
-- com NULL em colunas parciais no Postgres da mesma forma.

-- Cover única por produto + cor (incluindo geral onde color_key é null)
drop index if exists product_media_unique_cover_per_color;
create unique index product_media_unique_cover_per_color
  on public.product_media (product_id, coalesce(color_key, '__general__'))
  where role = 'cover';

-- Hover única por produto + cor
drop index if exists product_media_unique_hover_per_color;
create unique index product_media_unique_hover_per_color
  on public.product_media (product_id, coalesce(color_key, '__general__'))
  where role = 'hover';
