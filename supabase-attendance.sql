-- CHẠY MỘT LẦN trong Supabase > SQL Editor (project đang dùng).
-- Bảng điểm danh RIÊNG, không đụng tới kv hoặc dữ liệu thành viên cũ.
create table if not exists public.attendance_rounds (
 id uuid primary key default gen_random_uuid(), title text not null check(length(title) between 1 and 100),
 is_active boolean not null default false, created_at timestamptz not null default now()
);
create unique index if not exists one_active_attendance_round on public.attendance_rounds(is_active) where is_active=true;
create table if not exists public.attendance_entries (
 id uuid primary key default gen_random_uuid(), round_id uuid not null references public.attendance_rounds(id) on delete cascade,
 ingame_name text not null check(length(trim(ingame_name)) between 2 and 50),
 class_name text not null check(class_name in ('Cửu Linh','Toái Mộng','Huyết Hà','Long Ngâm','Thiết Y','Thần Tương','Tố Vấn')),
 created_at timestamptz not null default now()
);
create unique index if not exists attendance_unique_name on public.attendance_entries(round_id,lower(trim(ingame_name)));
alter table public.attendance_rounds enable row level security;
alter table public.attendance_entries enable row level security;
-- Người truy cập công khai chỉ xem đợt đang mở và đăng ký của đợt đang mở.
create policy "public view active rounds" on public.attendance_rounds for select to anon using (is_active=true);
create policy "public view active entries" on public.attendance_entries for select to anon using (exists(select 1 from public.attendance_rounds r where r.id=round_id and r.is_active=true));
create policy "public register active round" on public.attendance_entries for insert to anon with check (exists(select 1 from public.attendance_rounds r where r.id=round_id and r.is_active=true));
-- Chỉ SQL Editor/service role được mở, đóng, xóa đợt; anon không được update/delete.
grant usage on schema public to anon;
grant select on public.attendance_rounds to anon;
grant select,insert on public.attendance_entries to anon;
-- Mở đợt đầu tiên nếu chưa có đợt nào đang mở.
insert into public.attendance_rounds(title,is_active)
select 'Bang chiến thử nghiệm',true where not exists(select 1 from public.attendance_rounds where is_active=true);
-- TẠO ĐỢT MỚI (chạy riêng trong SQL Editor khi cần):
-- update public.attendance_rounds set is_active=false where is_active=true;
-- insert into public.attendance_rounds(title,is_active) values ('Bang chiến 01/11',true);
-- Xem tất cả đăng ký: select * from public.attendance_entries order by created_at desc;
