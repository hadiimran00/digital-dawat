-- Security hardening (found by testing on 2026-10-11). Run once in the Supabase SQL editor.
-- The page already enforces these rules; this makes the database enforce them too, so calling the API directly can't skip them.

-- 1-3. RSVPs from a guest-list link: within their reserved places, only their events, and one reply per guest
--      (a new reply replaces the old one, so guests can change their answer and totals never double-count).
-- 4.   At most 30 replies per invitation per minute (stops a script flooding a host's list).
create or replace function public.check_rsvp() returns trigger
language plpgsql security definer set search_path = public as $$
declare g public.guests%rowtype; recent integer;
begin
  select count(*) into recent from public.rsvps where invite_id = new.invite_id and created_at > now() - interval '1 minute';
  if recent >= 30 then raise exception 'too many replies right now, please try again in a minute'; end if;
  if new.guest_id is not null then
    select * into g from public.guests where id = new.guest_id and invite_id = new.invite_id;
    if not found then raise exception 'unknown guest'; end if;
    if new.attending and new.guests > g.seats then raise exception 'more guests than the places reserved for you'; end if;
    if new.events is not null and g.events is not null and not (new.events <@ g.events) then
      raise exception 'reply includes an event you are not invited to';
    end if;
    delete from public.rsvps where guest_id = new.guest_id; -- latest answer wins
  end if;
  return new;
end $$;
drop trigger if exists rsvps_check on public.rsvps;
create trigger rsvps_check before insert on public.rsvps for each row execute function public.check_rsvp();
revoke execute on function public.check_rsvp() from public, anon, authenticated;

-- 5. Invitation content size limit (real invitations are a few KB).
alter table public.invites add constraint invites_content_size check (octet_length(content::text) <= 60000) not valid;

-- 6. Guest list size limit per invitation.
create or replace function public.check_guest_count() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.guests where invite_id = new.invite_id) >= 1500 then
    raise exception 'an invitation can have at most 1500 guests';
  end if;
  return new;
end $$;
drop trigger if exists guests_count on public.guests;
create trigger guests_count before insert on public.guests for each row execute function public.check_guest_count();
revoke execute on function public.check_guest_count() from public, anon, authenticated;

-- Clean up the data created by the security test (test accounts only).
delete from public.rsvps where guest_name like 'SECURITY TEST%';
delete from public.invites where owner_id = (select id from auth.users where email = 'e2e-attacker@digitaldawat.test');
delete from auth.users where email = 'e2e-attacker@digitaldawat.test';
