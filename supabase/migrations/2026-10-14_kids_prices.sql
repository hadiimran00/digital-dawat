-- The kids' party birthday designs (2026-10-14). Run in the Supabase SQL editor before they go live.
insert into public.template_prices (template_id, price_pkr) values
  ('jashn-birthday', 1499),
  ('khilona-birthday', 1499),
  ('pari-birthday', 1499)
on conflict (template_id) do update set price_pkr = excluded.price_pkr;
