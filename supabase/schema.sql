-- Dawat database schema. Run once in the Supabase SQL editor.
-- Security model: every table has row-level security; the public can only read PUBLISHED invites
-- and insert RSVPs for them. Admins are rows in public.admins.

create extension if not exists pgcrypto;

create table public.admins (
  user_id uuid primary key references auth.users on delete cascade
);

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

create table public.invites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]{6,16}$'),
  template_id text not null,
  content jsonb not null,
  status text not null default 'draft' check (status in ('draft','published','unpublished')),
  created_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  invite_id uuid not null references public.invites on delete cascade,
  amount_pkr integer not null check (amount_pkr > 0),
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment','pending_review','approved','rejected')),
  receipt_path text,
  payment_method text check (payment_method in ('bank','jazzcash','easypaisa','sadapay')),
  payment_reference text,
  admin_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites on delete cascade,
  guest_name text not null check (char_length(guest_name) between 1 and 80),
  attending boolean not null,
  guests integer not null default 1 check (guests between 0 and 20),
  note text check (char_length(note) <= 300),
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;
alter table public.invites enable row level security;
alter table public.orders enable row level security;
alter table public.rsvps enable row level security;

-- admins: a signed-in user can see only their own row (lets the app check "am I an admin?")
create policy "read own admin row" on public.admins for select using (user_id = auth.uid());

-- invites
create policy "owner reads own invites" on public.invites for select using (owner_id = auth.uid() or public.is_admin());
create policy "public reads published invites" on public.invites for select using (status = 'published');
create policy "owner creates draft invites" on public.invites for insert
  with check (owner_id = auth.uid() and status = 'draft');
-- owners may edit content only while the invite is still a draft; status changes are admin-only.
create policy "owner edits own draft" on public.invites for update
  using (owner_id = auth.uid() and status = 'draft') with check (owner_id = auth.uid() and status = 'draft');
create policy "admin manages invites" on public.invites for all using (public.is_admin()) with check (public.is_admin());

-- orders
create policy "owner reads own orders" on public.orders for select using (owner_id = auth.uid() or public.is_admin());
create policy "owner creates own order" on public.orders for insert
  with check (owner_id = auth.uid() and status = 'awaiting_payment' and receipt_path is null);
create policy "owner submits receipt" on public.orders for update
  using (owner_id = auth.uid() and status in ('awaiting_payment','rejected'))
  with check (owner_id = auth.uid() and status = 'pending_review');
create policy "admin manages orders" on public.orders for all using (public.is_admin()) with check (public.is_admin());

-- rsvps: anyone can respond to a published invite; only the owner/admin can read.
create policy "public rsvp to published" on public.rsvps for insert
  with check (exists (select 1 from public.invites i where i.id = invite_id and i.status = 'published'));
create policy "owner reads rsvps" on public.rsvps for select
  using (exists (select 1 from public.invites i where i.id = invite_id and (i.owner_id = auth.uid() or public.is_admin())));

-- Amount is set server-side from a price list so a client cannot underpay.
create table public.template_prices (template_id text primary key, price_pkr integer not null check (price_pkr > 0));
alter table public.template_prices enable row level security;
create policy "anyone reads prices" on public.template_prices for select using (true);

create or replace function public.enforce_order_amount() returns trigger
language plpgsql security definer set search_path = public as $$
declare p integer; t text;
begin
  select template_id into t from public.invites where id = new.invite_id and owner_id = new.owner_id;
  select price_pkr into p from public.template_prices where template_id = t;
  if p is null then raise exception 'unknown template price'; end if;
  new.amount_pkr := p;
  return new;
end $$;
create trigger orders_amount before insert on public.orders for each row execute function public.enforce_order_amount();


-- Customers may only change payment fields on their order, never price, owner or invite.
create or replace function public.lock_order_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() and (new.amount_pkr <> old.amount_pkr or new.owner_id <> old.owner_id
     or new.invite_id <> old.invite_id or new.admin_note is distinct from old.admin_note
     or new.reviewed_at is distinct from old.reviewed_at) then
    raise exception 'these fields cannot be changed';
  end if;
  return new;
end $$;
create trigger orders_lock before update on public.orders for each row execute function public.lock_order_fields();

-- Approving an order publishes its invite (admin only; checked inside the function).
create or replace function public.review_order(order_id uuid, approve boolean, note text default null) returns void
language plpgsql security definer set search_path = public as $$
declare inv uuid;
begin
  if not public.is_admin() then raise exception 'not allowed'; end if;
  update public.orders
    set status = case when approve then 'approved' else 'rejected' end,
        admin_note = note, reviewed_at = now()
    where id = order_id and status = 'pending_review'
    returning invite_id into inv;
  if inv is null then raise exception 'order not pending review'; end if;
  if approve then update public.invites set status = 'published' where id = inv; end if;
end $$;

-- Private bucket for payment receipts. Path convention: <user_id>/<order_id>.<ext>
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false) on conflict do nothing;
create policy "owner uploads receipt" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner replaces receipt" on storage.objects for update to authenticated
  using (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "owner or admin reads receipt" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

-- After you sign up once, make yourself admin (replace the email):
--   insert into public.admins select id from auth.users where email = 'you@example.com';
-- Seed prices (keep in sync with src/lib/templates.ts):
insert into public.template_prices values
 ('zamurd-nikkah',2499),('gulab-nikkah',2499),('haldi-mehndi',1999),('mehr-mehndi',1999),
 ('shahi-baraat',2999),('chandni-walima',2499),('mangni-engagement',1999),('hilal-eid',999),
 ('rang-birthday',999),('nanha-baby',1499)
on conflict (template_id) do update set price_pkr = excluded.price_pkr;

-- Table privileges for the API roles (row-level security above still decides which rows).
-- Applied to the live project as migration "grant_table_privileges".
grant usage on schema public to anon, authenticated;
grant select on public.admins to authenticated;
grant select on public.invites to anon, authenticated;
grant insert, update on public.invites to authenticated;
grant select, insert, update on public.orders to authenticated;
grant insert on public.rsvps to anon, authenticated;
grant select on public.rsvps to authenticated;
grant select on public.template_prices to anon, authenticated;

-- Applied as migration "restrict_function_execute". is_admin() must stay executable (policies call it).
revoke execute on function public.enforce_order_amount() from public, anon, authenticated;
revoke execute on function public.lock_order_fields() from public, anon, authenticated;
revoke execute on function public.review_order(uuid, boolean, text) from public, anon;
grant execute on function public.review_order(uuid, boolean, text) to authenticated;
