-- V5: Chạy toàn bộ trong Supabase SQL Editor, SAU file supabase-attendance.sql cũ.
-- Không xóa dữ liệu điểm danh đang có.
create extension if not exists pgcrypto;
alter table public.attendance_entries add column if not exists owner_secret_hash text;
create table if not exists public.attendance_admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.attendance_admins enable row level security;
revoke all on public.attendance_admins from anon, authenticated;
-- Ngăn việc chèn trực tiếp bỏ qua mã sở hữu: chỉ được đăng ký qua RPC.
drop policy if exists "public register active round" on public.attendance_entries;
revoke insert,update,delete on public.attendance_entries from anon,authenticated;
create or replace function public.attendance_register(p_round_id uuid,p_ingame_name text,p_class_name text,p_owner_secret text)
returns uuid language plpgsql security definer set search_path=public,pg_temp as $$
declare new_id uuid;
begin
 if not exists(select 1 from public.attendance_rounds where id=p_round_id and is_active) then raise exception 'Đợt điểm danh đã đóng'; end if;
 if length(trim(p_ingame_name)) not between 2 and 50 or p_class_name not in ('Cửu Linh','Toái Mộng','Huyết Hà','Long Ngâm','Thiết Y','Thần Tương','Tố Vấn') then raise exception 'Tên hoặc phái không hợp lệ'; end if;
 if p_owner_secret !~ '^[a-f0-9]{64}$' then raise exception 'Mã sở hữu không hợp lệ'; end if;
 insert into public.attendance_entries(round_id,ingame_name,class_name,owner_secret_hash)
 values(p_round_id,trim(p_ingame_name),p_class_name,encode(digest(p_owner_secret,'sha256'),'hex')) returning id into new_id;
 return new_id;
end $$;
create or replace function public.attendance_remove_entry(p_entry_id uuid,p_owner_secret text default null)
returns void language plpgsql security definer set search_path=public,pg_temp as $$
begin
 if exists(select 1 from public.attendance_admins where user_id=auth.uid()) then
   delete from public.attendance_entries where id=p_entry_id;
 elsif p_owner_secret is not null and p_owner_secret ~ '^[a-f0-9]{64}$' then
   delete from public.attendance_entries where id=p_entry_id and owner_secret_hash=encode(digest(p_owner_secret,'sha256'),'hex');
   if not found then raise exception 'Mã sở hữu không đúng hoặc tên đã bị xóa'; end if;
 else raise exception 'Bạn không có quyền xóa tên này'; end if;
end $$;
revoke all on function public.attendance_register(uuid,text,text,text) from public;
revoke all on function public.attendance_remove_entry(uuid,text) from public;
grant execute on function public.attendance_register(uuid,text,text,text) to anon,authenticated;
grant execute on function public.attendance_remove_entry(uuid,text) to anon,authenticated;
-- QUAN TRỌNG: Thêm UID của mỗi tài khoản quản trị trong Authentication > Users:
-- insert into public.attendance_admins(user_id) values ('UID-TAI-KHOAN-QUAN-TRI') on conflict do nothing;
-- Những bản ghi cũ (trước V5) không có mã sở hữu: chỉ admin xóa được.
