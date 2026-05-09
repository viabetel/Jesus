-- ============================================================
-- Fashion Store — schema de produtos e variantes
-- Rode UMA VEZ no SQL Editor depois do schema.sql.
-- ============================================================

-- ===== Produtos =====
create table if not exists public.products (
  id              text primary key,
  slug            text unique not null,
  sku             text unique not null,
  name            text not null,
  category        text not null,
  status          text not null default 'ativo'
                  check (status in ('ativo','rascunho','oculto','esgotado')),
  price           numeric(10,2) not null check (price > 0),
  original_price  numeric(10,2) check (original_price is null or original_price > price),
  badge           text,
  description     text not null default '',
  details         jsonb not null default '[]'::jsonb,
  images          jsonb not null default '[]'::jsonb,
  video           text,
  is_new          boolean not null default false,
  is_promotion    boolean not null default false,
  is_bestseller   boolean not null default false,
  tags            jsonb not null default '[]'::jsonb,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists products_slug_idx on public.products (slug);
create index if not exists products_status_idx on public.products (status);
create index if not exists products_category_idx on public.products (category);
create index if not exists products_sort_idx on public.products (sort_order, created_at);

-- ===== Variantes =====
create table if not exists public.product_variants (
  sku         text primary key,
  product_id  text not null references public.products(id) on delete cascade,
  color_name  text not null,
  color_hex   text not null,
  size        text not null check (size in ('P','M','G','GG')),
  stock       integer not null default 0 check (stock >= 0),
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (product_id, color_name, size)
);

create index if not exists variants_product_idx on public.product_variants (product_id);
create index if not exists variants_active_idx on public.product_variants (active);

-- ===== Trigger pra atualizar `updated_at` automaticamente =====
create or replace function public.tg_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tg_products_updated_at on public.products;
create trigger tg_products_updated_at
  before update on public.products
  for each row execute function public.tg_set_updated_at();

drop trigger if exists tg_variants_updated_at on public.product_variants;
create trigger tg_variants_updated_at
  before update on public.product_variants
  for each row execute function public.tg_set_updated_at();

-- ===== RLS =====
-- Anon NÃO escreve. Anon pode LER produtos ativos (catálogo público).
alter table public.products enable row level security;
alter table public.product_variants enable row level security;

-- Permite leitura pública apenas de produtos ativos e variantes ativas
drop policy if exists "products read public" on public.products;
create policy "products read public"
  on public.products for select
  using (status = 'ativo');

drop policy if exists "variants read public" on public.product_variants;
create policy "variants read public"
  on public.product_variants for select
  using (active = true);

-- service_role bypassa RLS, então o admin/server pode tudo.
