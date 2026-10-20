-- Removes the 100 test replies sent by the 100-guest load test on 2026-10-18 (every one is named "LOADTEST 001" to
-- "LOADTEST 100"). Run once in the Supabase SQL editor. Real replies are not touched.
delete from public.rsvps where guest_name like 'LOADTEST %';
