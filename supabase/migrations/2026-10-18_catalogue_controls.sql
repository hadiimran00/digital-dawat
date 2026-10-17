-- Catalogue controls (2026-10-18). Run in the Supabase SQL editor.
-- After this, the site reads each design's price and visibility from public.template_prices:
--   visible = 'Y'  shown in the gallery and can be ordered
--   visible = 'N'  hidden from the gallery, its page says it is no longer available, and new orders are refused.
--                  Invitations already made with it keep working for their guests.
alter table public.template_prices add column if not exists visible text not null default 'Y';
alter table public.template_prices drop constraint if exists template_prices_visible_yn;
alter table public.template_prices add constraint template_prices_visible_yn check (visible in ('Y', 'N'));
comment on column public.template_prices.visible is 'Y = shown on the site; N = hidden (existing invitations keep working).';

-- the 22 original designs removed on 2026-10-17: keep their rows (old orders point at them) but hide them
update public.template_prices set visible = 'N' where template_id in (
  'zamurd-nikkah', 'gulab-nikkah', 'haldi-mehndi', 'mehr-mehndi', 'shahi-baraat', 'chandni-walima', 'mangni-engagement',
  'hilal-eid', 'rang-birthday', 'nanha-baby', 'mehrab-wedding', 'jharokha-baraat', 'noor-nikkah', 'jali-walima',
  'rangmahal-mehndi', 'dholki-raat', 'sitara-engagement', 'roshan-eid', 'chaand-baby', 'gulzar-birthday',
  'gulistan-nikkah', 'bagh-walima');

-- a hidden design can't be ordered
create or replace function public.enforce_order_amount() returns trigger
language plpgsql security definer set search_path = public as $$
declare p integer; t text; v text;
begin
  select template_id into t from public.invites where id = new.invite_id and owner_id = new.owner_id;
  select price_pkr, visible into p, v from public.template_prices where template_id = t;
  if p is null then raise exception 'unknown template price'; end if;
  if v = 'N' then raise exception 'this design is no longer available'; end if;
  new.amount_pkr := p;
  return new;
end $$;
revoke execute on function public.enforce_order_amount() from public, anon, authenticated;

-- Site settings table (from 2026-10-12_settings.sql, which was never run). Everyone can read; only you, in the dashboard, edit.
create table if not exists public.settings (
  key text primary key,
  value text not null default '',
  note text,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings for select to anon, authenticated using (true);
grant select on public.settings to anon, authenticated;
insert into public.settings (key, value, note) values
  ('pay_bank', E'SadaPay\nAccount name: Muhammad Hadi Imran\nNumber: 0315 2705967',
   'Shown on the payment page. First line is a heading; each "Label: value" line gets a Copy button. Empty = hidden.'),
  ('pay_jazzcash', '', 'Optional second payment option, same format. Empty = hidden.'),
  ('pay_easypaisa', '', 'Optional third payment option, same format. Empty = hidden.')
on conflict (key) do nothing;

-- the price of "A design of your own choice" (PKR). Empty = the option is hidden.
insert into public.settings (key, value, note) values
  ('custom_design_price', '5000', 'Price in PKR for "A design of your own choice" (arranged on WhatsApp). Empty = option hidden.')
on conflict (key) do nothing;
