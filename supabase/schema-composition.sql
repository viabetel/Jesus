-- ============================================================
-- Fashion Store — campos de composição/cuidados/modelagem
-- Rode DEPOIS dos outros schemas.
-- Idempotente: usa IF NOT EXISTS implícito via ALTER TABLE ADD COLUMN IF NOT EXISTS.
-- ============================================================

alter table public.products add column if not exists composition text;
alter table public.products add column if not exists fit text;
alter table public.products add column if not exists care text;
