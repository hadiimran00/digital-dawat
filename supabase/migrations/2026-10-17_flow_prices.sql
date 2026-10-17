-- The flowing-page designs Hadiqa and Ambar (2026-10-17). Run in the Supabase SQL editor before they go live.
insert into public.template_prices (template_id, price_pkr) values
  ('hadiqa-wedding', 3999),
  ('ambar-nikkah', 3999)
on conflict (template_id) do update set price_pkr = excluded.price_pkr;
