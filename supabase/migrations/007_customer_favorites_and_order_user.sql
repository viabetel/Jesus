-- Migration 007: customer_favorites + orders.user_id

create table if not exists public.customer_favorites (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

create index if not exists customer_favorites_user_idx
  on public.customer_favorites (user_id);

create index if not exists customer_favorites_product_idx
  on public.customer_favorites (product_id);

alter table public.customer_favorites enable row level security;

drop policy if exists "favorites select own" on public.customer_favorites;
create policy "favorites select own"
  on public.customer_favorites
  for select
  using (auth.uid() = user_id);

drop policy if exists "favorites insert own" on public.customer_favorites;
create policy "favorites insert own"
  on public.customer_favorites
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "favorites delete own" on public.customer_favorites;
create policy "favorites delete own"
  on public.customer_favorites
  for delete
  using (auth.uid() = user_id);

-- Add user_id to orders
alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists orders_user_id_idx
  on public.orders (user_id);

create index if not exists orders_customer_email_lower_idx
  on public.orders ((lower(customer_email)));
