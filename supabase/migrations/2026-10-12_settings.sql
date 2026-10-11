-- Site settings the owner edits in the Supabase Table Editor (no redeploy needed). Run once in the SQL editor.
-- Everyone can read them (the payment page shows them to customers); nobody can change them through the API,
-- only the owner through the dashboard.
create table if not exists public.settings (
  key text primary key,
  value text not null default '',
  note text,
  updated_at timestamptz not null default now()
);
alter table public.settings enable row level security;
drop policy if exists settings_read on public.settings;
create policy settings_read on public.settings for select to anon, authenticated using (true);

insert into public.settings (key, value, note) values
  ('pay_bank', E'SadaPay\nAccount name: Muhammad Hadi Imran\nNumber: 0315 2705967',
   'Shown on the payment page. First line is a heading; each "Label: value" line gets a Copy button. Empty = hidden.'),
  ('pay_jazzcash', '', 'Optional second payment option, same format. Empty = hidden.'),
  ('pay_easypaisa', '', 'Optional third payment option, same format. Empty = hidden.')
on conflict (key) do nothing;
