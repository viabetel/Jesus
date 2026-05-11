-- ============================================================
-- Fashion Store — migration: campos de composição/cuidados
-- Rode no SQL Editor DEPOIS dos schemas anteriores.
-- ============================================================

-- Novos campos no produto
alter table public.products
  add column if not exists composition text not null default '',
  add column if not exists fit text not null default 'Regular',
  add column if not exists care jsonb not null default '[]'::jsonb,
  add column if not exists size_guide jsonb not null default '[]'::jsonb;

-- composition: "100% algodão premium, fio 30.1 penteado"
-- fit: "Regular" | "Oversized" | "Slim" | "Relaxed"
-- care: ["Lavar à máquina (30°C)", "Não usar alvejante", ...]
-- size_guide: [{"size":"P","width":"50cm","length":"68cm"}, ...]

comment on column public.products.composition is 'Material/composição do produto';
comment on column public.products.fit is 'Tipo de modelagem: Regular, Oversized, Slim, Relaxed';
comment on column public.products.care is 'Lista JSON de instruções de cuidados';
comment on column public.products.size_guide is 'Guia de medidas JSON [{size, width, length}]';
