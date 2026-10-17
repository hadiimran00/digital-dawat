-- Firdaus (2026-10-18). Run in the Supabase SQL editor before it goes live.
insert into public.template_prices (template_id, price_pkr) values
  ('firdaus-wedding', 3999)
on conflict (template_id) do update set price_pkr = excluded.price_pkr;
