-- ============================================================
-- Fashion Store — Storage bucket de mídia de produtos
-- Rode no SQL Editor após schema-products.sql.
-- ============================================================

-- Cria bucket público (leitura aberta — ideal pra mídia de catálogo)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media',
  'product-media',
  true,
  52428800, -- 50 MB
  array[
    'image/jpeg','image/jpg','image/png','image/webp','image/avif',
    'video/mp4','video/webm','video/quicktime'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ===== POLÍTICAS =====
-- Leitura: pública (qualquer um vê — necessário pra catálogo).
-- Escrita: só service_role (backend), via SUPABASE_SERVICE_KEY.

-- Limpa policies antigas
drop policy if exists "Public read product-media" on storage.objects;
drop policy if exists "Authenticated upload product-media" on storage.objects;

-- Leitura pública
create policy "Public read product-media"
  on storage.objects for select
  using (bucket_id = 'product-media');

-- Escrita: nenhuma policy para anon/authenticated.
-- service_role bypassa RLS. Isso é proposital — só o servidor escreve.
