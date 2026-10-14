-- Prices for designs added after the first price list. Without a row here, ordering the design fails
-- ("unknown template price"). Run in the Supabase SQL editor; safe to run more than once.
insert into public.template_prices (template_id, price_pkr) values
  ('kahani-wedding', 3999),
  ('roshni-wedding', 3999),
  ('mohr-wedding', 3999),
  ('afreen-wedding', 3999),
  ('qabool-nikkah', 2999),
  ('lifafa-birthday', 999),
  ('gubbara-birthday', 999),
  ('neelam-birthday', 999),
  ('pehli-birthday', 999),
  ('gulnaar-aqiqah', 1499),
  ('dua-aqiqah', 1499),
  ('bhalu-aqiqah', 1499),
  ('saadgi-engagement', 1999),
  ('zaitoon-engagement', 1999),
  ('surkh-nikkah', 2499)
on conflict (template_id) do update set price_pkr = excluded.price_pkr;
