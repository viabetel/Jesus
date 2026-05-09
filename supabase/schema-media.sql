-- ============================================================
-- Fashion Store — schema de mídia estruturada por produto
-- Rode no SQL Editor depois do schema-products.sql.
-- ============================================================

-- Mídia por produto, com role e ordem.
-- Substitui o array `images jsonb` quando você quer estrutura.
-- Compat: o repo continua aceitando o `images[]` antigo como fallback.
create table if not exists public.product_media (
  id           bigserial primary key,
  product_id   text not null references public.products(id) on delete cascade,
  url          text not null,
  storage_path text,                                 -- path interno no bucket (se for upload nosso)
  kind         text not null check (kind in ('image','video')),
  role         text not null default 'gallery'
               check (role in ('cover','hover','front','back','detail','model','lifestyle','gallery','video')),
  alt          text,
  sort_order   integer not null default 0,
  width        integer,
  height       integer,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index if not exists product_media_product_idx
  on public.product_media (product_id, sort_order);
create index if not exists product_media_role_idx
  on public.product_media (product_id, role);

-- updated_at automático
drop trigger if exists tg_media_updated_at on public.product_media;
create trigger tg_media_updated_at
  before update on public.product_media
  for each row execute function public.tg_set_updated_at();

-- RLS: leitura pública (catálogo), escrita só pelo backend via service_role
alter table public.product_media enable row level security;

drop policy if exists "media read public" on public.product_media;
create policy "media read public"
  on public.product_media for select
  using (true);
