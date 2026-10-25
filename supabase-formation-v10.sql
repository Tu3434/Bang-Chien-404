-- Chạy trong Supabase SQL Editor (chỉ một lần). Không xóa bảng điểm danh cũ.
create table if not exists public.formation_v10 (
 cell_key text primary key,
 value text not null default '',
 phai text,
 updated_at timestamptz not null default now()
);
alter table public.formation_v10 enable row level security;
grant select on public.formation_v10 to anon, authenticated;
grant insert, update, delete on public.formation_v10 to authenticated;
drop policy if exists "formation_v10_read" on public.formation_v10;
create policy "formation_v10_read" on public.formation_v10 for select to anon, authenticated using (true);
drop policy if exists "formation_v10_admin_insert" on public.formation_v10;
create policy "formation_v10_admin_insert" on public.formation_v10 for insert to authenticated with check (exists (select 1 from public.attendance_admins a where a.user_id = (select auth.uid())));
drop policy if exists "formation_v10_admin_update" on public.formation_v10;
create policy "formation_v10_admin_update" on public.formation_v10 for update to authenticated using (exists (select 1 from public.attendance_admins a where a.user_id = (select auth.uid()))) with check (exists (select 1 from public.attendance_admins a where a.user_id = (select auth.uid())));
drop policy if exists "formation_v10_admin_delete" on public.formation_v10;
create policy "formation_v10_admin_delete" on public.formation_v10 for delete to authenticated using (exists (select 1 from public.attendance_admins a where a.user_id = (select auth.uid())));
