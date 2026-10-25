-- Chạy SAU supabase-attendance.sql và supabase-attendance-v5.sql.
-- Sửa quyền đọc khi đăng nhập Supabase, đồng thời giữ an toàn RLS.
-- Không xóa hoặc thay đổi các bản ghi điểm danh.
grant select on public.attendance_rounds, public.attendance_entries to authenticated;
drop policy if exists "authenticated view active rounds" on public.attendance_rounds;
create policy "authenticated view active rounds" on public.attendance_rounds for select to authenticated using (is_active = true);
drop policy if exists "authenticated view active entries" on public.attendance_entries;
create policy "authenticated view active entries" on public.attendance_entries for select to authenticated using (exists(select 1 from public.attendance_rounds r where r.id=round_id and r.is_active=true));
-- Cần THÊM UID của tài khoản admin vào bảng attendance_admins (không phải email):
-- select id,email from auth.users;
-- insert into public.attendance_admins(user_id) values ('UID-ADMIN-THUC-TE') on conflict do nothing;
-- Kiểm tra: select a.user_id,u.email from public.attendance_admins a join auth.users u on u.id=a.user_id;
