-- ============================================================
-- Fashion Store — schema do Supabase
-- Cole isto no SQL Editor do Supabase e rode uma vez.
-- ============================================================

-- Tabela de pedidos
create table if not exists public.orders (
  id            text primary key,
  number        text unique not null,
  customer_name text not null,
  customer_whatsapp text not null,
  customer_email text not null,
  items         jsonb not null,
  subtotal      numeric(10,2) not null,
  total         numeric(10,2) not null,
  status        text not null default 'recebido'
                check (status in ('recebido','confirmado','enviado','entregue','cancelado')),
  address       text,
  observation   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

-- Sequência para numeração FS-1001, FS-1002, ...
create sequence if not exists public.order_number_seq start with 1001;

-- RPC para obter o próximo número (usado pelo backend)
create or replace function public.next_order_number()
returns integer
language sql
volatile
security definer
as $$
  select nextval('public.order_number_seq')::int;
$$;

grant execute on function public.next_order_number() to service_role;

-- Reserva de estoque por SKU de variante
create table if not exists public.stock_reservations (
  id          bigserial primary key,
  order_id    text references public.orders(id) on delete cascade,
  variant_sku text not null,
  quantity    integer not null check (quantity > 0),
  -- 'reserved' enquanto pedido está em 'recebido' / 'confirmado'
  -- 'consumed' quando pedido virou 'entregue'
  -- 'released' quando pedido virou 'cancelado'
  state       text not null default 'reserved'
              check (state in ('reserved','consumed','released')),
  created_at  timestamptz not null default now()
);

create index if not exists stock_reservations_sku_state_idx
  on public.stock_reservations (variant_sku, state);
create index if not exists stock_reservations_order_idx
  on public.stock_reservations (order_id);

-- Função para calcular estoque consumido por SKU (reservas ativas + consumidas)
create or replace function public.consumed_stock(p_sku text)
returns integer
language sql
stable
as $$
  select coalesce(sum(quantity), 0)::int
  from public.stock_reservations
  where variant_sku = p_sku and state in ('reserved','consumed');
$$;

-- Habilitar RLS por boa prática.
-- O backend usa SERVICE_KEY (bypassa RLS) então só faz diferença se um dia
-- alguém usar a anon key. Deixamos as tabelas trancadas pra anon.
alter table public.orders enable row level security;
alter table public.stock_reservations enable row level security;

-- Sem políticas = ninguém com anon key consegue ler/escrever.
-- Isso é proposital: só o servidor (com service_role) acessa estas tabelas.
