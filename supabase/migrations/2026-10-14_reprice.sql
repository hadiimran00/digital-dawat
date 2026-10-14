-- Prices set by what each design includes (photo scenes, song, opening animation, illustration), 2026-10-14.
-- Orders already placed keep the price they were placed at. Run in the Supabase SQL editor before the site update.
insert into public.template_prices (template_id, price_pkr) values
  ('darbar-wedding', 4999),
  ('wisaal-wedding', 4999),
  ('replay-wedding', 4999),
  ('afreen-wedding', 4499),
  ('kahani-wedding', 3999),
  ('roshni-wedding', 3499),
  ('mohr-wedding', 3499),
  ('mehrab-wedding', 2999),
  ('shahi-baraat', 2499),
  ('jharokha-baraat', 2499),
  ('qabool-nikkah', 3499),
  ('surkh-nikkah', 2999),
  ('saadgi-engagement', 2499),
  ('zaitoon-engagement', 2499),
  ('gulnaar-aqiqah', 1999),
  ('dua-aqiqah', 1999),
  ('bhalu-aqiqah', 1999),
  ('lifafa-birthday', 1499),
  ('gubbara-birthday', 1499),
  ('neelam-birthday', 1499),
  ('pehli-birthday', 1499)
on conflict (template_id) do update set price_pkr = excluded.price_pkr;
