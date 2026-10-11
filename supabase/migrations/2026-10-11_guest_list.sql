-- Guest list + per-event RSVPs. Run once in the Supabase SQL editor (or approve it in Claude Code).
-- Guest list: one row per invited guest (or family), each with a private link code and the events they are invited to.
create table public.guests (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.invites on delete cascade,
  code text not null unique check (code ~ '^[a-z0-9]{8,16}$'),
  name text not null check (char_length(name) between 1 and 80),
  phone text check (phone is null or phone ~ '^[0-9]{8,15}$'),
  seats integer not null default 1 check (seats between 1 and 20),
  -- positions in invites.content.events; null = every event
  events integer[] check (events is null or cardinality(events) between 1 and 6),
  sent_at timestamptz,
  opened_at timestamptz,
  created_at timestamptz not null default now()
);
create index guests_invite_idx on public.guests (invite_id);
alter table public.guests enable row level security;
create policy "owner manages guests" on public.guests for all to authenticated
  using (exists (select 1 from public.invites i where i.id = invite_id and (i.owner_id = auth.uid() or public.is_admin())))
  with check (exists (select 1 from public.invites i where i.id = invite_id and (i.owner_id = auth.uid() or public.is_admin())));
grant select, insert, update, delete on public.guests to authenticated;

-- RSVPs remember which guest replied and which events they will attend.
alter table public.rsvps add column guest_id uuid references public.guests on delete set null;
alter table public.rsvps add column events integer[] check (events is null or cardinality(events) between 1 and 6);

-- A guest's RSVP may only point at a guest of the same invitation (guests are not readable by the public).
create or replace function public.guest_in_invite(gid uuid, iid uuid) returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.guests where id = gid and invite_id = iid);
$$;
drop policy "public rsvp to published" on public.rsvps;
create policy "public rsvp to published" on public.rsvps for insert
  with check (
    exists (select 1 from public.invites i where i.id = invite_id and i.status = 'published')
    and (guest_id is null or public.guest_in_invite(guest_id, invite_id))
  );

-- The holder of a link code can read only that guest's name, places and events.
create or replace function public.guest_by_code(p_slug text, p_code text)
returns table (id uuid, name text, seats integer, events integer[])
language sql security definer set search_path = public stable as $$
  select g.id, g.name, g.seats, g.events
  from public.guests g join public.invites i on i.id = g.invite_id
  where i.slug = p_slug and g.code = p_code
    and (i.status = 'published' or i.owner_id = auth.uid() or public.is_admin());
$$;

-- First open of a guest's link (not the host previewing it).
create or replace function public.mark_guest_opened(p_slug text, p_code text) returns void
language sql security definer set search_path = public as $$
  update public.guests g set opened_at = now()
  from public.invites i
  where i.id = g.invite_id and i.slug = p_slug and g.code = p_code and g.opened_at is null
    and i.status = 'published' and i.owner_id is distinct from auth.uid();
$$;

revoke execute on function public.guest_in_invite(uuid, uuid) from public;
revoke execute on function public.guest_by_code(text, text) from public;
revoke execute on function public.mark_guest_opened(text, text) from public;
grant execute on function public.guest_in_invite(uuid, uuid) to anon, authenticated;
grant execute on function public.guest_by_code(text, text) to anon, authenticated;
grant execute on function public.mark_guest_opened(text, text) to anon, authenticated;
