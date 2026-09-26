-- 관리자 잠금: 운동 쓰기/수정/삭제를 관리자 비밀번호가 있어야만 가능하게 만든다.
-- 반드시 순서대로 실행한다.
--   1단계: 이 PR을 배포하기 "전에" 실행 (기존 관리자 화면은 그대로 계속 동작)
--   2단계: 이 PR이 배포된 "후에" 실행 (익명 쓰기 권한 제거)

-- =====================================================================
-- 1단계
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- 비밀번호 해시 보관용. RLS만 켜고 정책을 두지 않아 외부에서는 읽을 수 없다.
create table if not exists public.admin_secret (
  id int primary key default 1 check (id = 1),
  password_hash text not null
);
alter table public.admin_secret enable row level security;
revoke all on public.admin_secret from anon, authenticated;

-- 아래 '새-비밀번호' 부분을 새 관리자 비밀번호로 바꿔서 실행한다.
-- (기존 비밀번호는 사이트 코드에 노출됐으므로 새 비밀번호를 쓴다)
insert into public.admin_secret (id, password_hash)
values (1, extensions.crypt('새-비밀번호', extensions.gen_salt('bf')))
on conflict (id) do update set password_hash = excluded.password_hash;

create or replace function public.admin_check_password(p_password text)
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from admin_secret
    where password_hash = crypt(coalesce(p_password, ''), password_hash)
  );
$$;

create or replace function public.admin_save_workout(
  p_password text,
  p_id uuid,
  p_date date,
  p_title text,
  p_format text,
  p_exercises text[]
)
returns uuid
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
begin
  if not admin_check_password(p_password) then
    raise exception '관리자 비밀번호가 맞지 않습니다' using errcode = '28P01';
  end if;

  if p_id is null then
    insert into workouts (date, title, format, exercises)
    values (p_date, p_title, p_format, p_exercises)
    returning id into v_id;
  else
    update workouts
    set date = p_date, title = p_title, format = p_format, exercises = p_exercises
    where id = p_id
    returning id into v_id;

    if v_id is null then
      raise exception '수정할 운동을 찾을 수 없습니다';
    end if;
  end if;

  return v_id;
end;
$$;

create or replace function public.admin_delete_workout(p_password text, p_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not admin_check_password(p_password) then
    raise exception '관리자 비밀번호가 맞지 않습니다' using errcode = '28P01';
  end if;
  delete from workouts where id = p_id;
end;
$$;

revoke all on function public.admin_check_password(text) from public;
revoke all on function public.admin_save_workout(text, uuid, date, text, text, text[]) from public;
revoke all on function public.admin_delete_workout(text, uuid) from public;
grant execute on function public.admin_check_password(text) to anon, authenticated;
grant execute on function public.admin_save_workout(text, uuid, date, text, text, text[]) to anon, authenticated;
grant execute on function public.admin_delete_workout(text, uuid) to anon, authenticated;


-- =====================================================================
-- 2단계 (배포 후 실행)
-- =====================================================================

alter table public.workouts enable row level security;

-- 읽기(SELECT) 외의 정책을 모두 제거
do $$
declare
  p record;
begin
  for p in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'workouts' and cmd <> 'SELECT'
  loop
    execute format('drop policy %I on public.workouts', p.policyname);
  end loop;
end;
$$;

drop policy if exists "Public Read Access" on public.workouts;
create policy "Public Read Access" on public.workouts for select using (true);

revoke insert, update, delete, truncate on public.workouts from anon, authenticated;
