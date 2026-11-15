-- Empty roster schema. Do not commit real personnel records to this repository.
create table if not exists public.personnel (
  id text primary key,
  unit text not null unique,
  rank text not null,
  name text not null,
  platoon integer not null default 1 check (platoon in (1, 2))
);

alter table public.personnel enable row level security;

-- The browser app uses only the public anon key. Signed-out visitors get no table access.
revoke all on table public.personnel from anon, authenticated;
grant select, insert, update, delete on table public.personnel to authenticated;

drop policy if exists "Team members can read personnel" on public.personnel;
drop policy if exists "Team members can add personnel" on public.personnel;
drop policy if exists "Team members can update personnel" on public.personnel;
drop policy if exists "Team members can delete personnel" on public.personnel;

create policy "Team members can read personnel" on public.personnel
  for select to authenticated using (true);
create policy "Team members can add personnel" on public.personnel
  for insert to authenticated with check (true);
create policy "Team members can update personnel" on public.personnel
  for update to authenticated using (true) with check (true);
create policy "Team members can delete personnel" on public.personnel
  for delete to authenticated using (true);
