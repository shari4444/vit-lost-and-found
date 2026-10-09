-- ================================================================================
-- VIT LOST & FOUND PORTAL - COMPLETE POSTGRESQL SCHEMA MIGRATION
-- Run this ONCE in the Supabase SQL Editor.
-- Safe / Idempotent: checks IF NOT EXISTS and safely manages triggers & policies.
-- ================================================================================

-- 1. PROFILES TABLES
create table if not exists public.students (
  student_id   uuid primary key references auth.users(id) on delete cascade,
  roll_no      text not null unique,
  name         text not null,
  email        text not null unique,
  department   text,
  phone_number text
);

create table if not exists public.admins (
  admin_id uuid primary key references auth.users(id) on delete cascade,
  name     text not null,
  email    text not null unique
);

-- 2. LOST REQUESTS TABLE
create table if not exists public.lost_requests (
  request_id  bigint generated always as identity primary key,
  student_id  uuid not null references public.students(student_id) on delete cascade,
  reviewed_by uuid references public.admins(admin_id),
  category    text not null,
  colour      text,
  description text,
  photo_url   text,
  date_report date not null default current_date,
  status      text not null default 'Pending'
    check (status in ('Pending','Under Review','Matched','Collected','Closed'))
);

-- 3. FOUND ITEMS TABLE
create table if not exists public.found_items (
  found_id    bigint generated always as identity primary key,
  admin_id    uuid not null references public.admins(admin_id),
  category    text not null,
  colour      text,
  description text,
  photo_url   text,
  date_found  date not null default current_date,
  location    text,
  status      text not null default 'Unclaimed'
    check (status in ('Unclaimed','Matched','Returned'))
);

-- 4. MANY-TO-MANY JUNCTION (MATCHES)
create table if not exists public.item_matches (
  match_id   bigint generated always as identity primary key,
  request_id bigint not null references public.lost_requests(request_id),
  found_id   bigint not null references public.found_items(found_id),
  match_date date not null default current_date,
  unique (request_id, found_id)
);

-- 5. NOTIFICATIONS TABLE
create table if not exists public.notifications (
  notify_id    bigint generated always as identity primary key,
  student_id   uuid not null references public.students(student_id) on delete cascade,
  match_id     bigint not null unique references public.item_matches(match_id),
  message      text not null,
  email_status text not null default 'Pending'
    check (email_status in ('Pending','Sent','Failed')),
  sent_date    timestamptz default now()
);

-- ================================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================================

-- Student profile creation trigger on signup
create or replace function public.handle_new_student() returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.raw_user_meta_data ? 'roll_no' then
    insert into public.students (
      student_id,
      roll_no,
      name,
      email,
      department,
      phone_number
    )
    values (
      new.id,
      new.raw_user_meta_data->>'roll_no',
      coalesce(new.raw_user_meta_data->>'name', 'Student'),
      new.email,
      new.raw_user_meta_data->>'department',
      new.raw_user_meta_data->>'phone_number'
    )
    on conflict (student_id) do update
    set
      roll_no = excluded.roll_no,
      name = excluded.name,
      department = excluded.department,
      phone_number = excluded.phone_number;
  end if;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_student();

-- Admin check function
create or replace function public.is_admin() returns boolean
language sql
security definer
stable
set search_path = public
as
$$
  select exists (
    select 1
    from public.admins
    where admin_id = auth.uid()
  )
$$;

-- Atomic Match Creation RPC
create or replace function public.create_match(
  p_request_id bigint,
  p_found_id bigint
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_match bigint;
  v_student uuid;
begin
  if not public.is_admin() then
    raise exception 'admin only';
  end if;

  -- 1. Insert into item_matches
  insert into public.item_matches (
    request_id,
    found_id
  )
  values (
    p_request_id,
    p_found_id
  )
  returning match_id into v_match;

  -- 2. Update lost request status & reviewer
  update public.lost_requests
  set
    status = 'Matched',
    reviewed_by = auth.uid()
  where request_id = p_request_id
  returning student_id into v_student;

  -- 3. Update found item status
  update public.found_items
  set status = 'Matched'
  where found_id = p_found_id;

  -- 4. Create notification for the student
  insert into public.notifications (
    student_id,
    match_id,
    message
  )
  values (
    v_student,
    v_match,
    'Good news! A found item matching your lost request #'
    || p_request_id
    || ' has been located. Please visit the admin office to collect it.'
  );

  return v_match;
end $$;

-- ================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================================================

alter table public.students enable row level security;
alter table public.admins enable row level security;
alter table public.lost_requests enable row level security;
alter table public.found_items enable row level security;
alter table public.item_matches enable row level security;
alter table public.notifications enable row level security;

-- Policies for students
drop policy if exists "student reads own" on public.students;
create policy "student reads own"
on public.students for select
using (
  student_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "student updates own" on public.students;
create policy "student updates own"
on public.students for update
using (
  student_id = auth.uid()
);

-- Policies for admins
drop policy if exists "admin reads admins" on public.admins;
create policy "admin reads admins"
on public.admins for select
using (
  admin_id = auth.uid()
);

-- Policies for lost_requests
drop policy if exists "student reads own requests" on public.lost_requests;
create policy "student reads own requests"
on public.lost_requests for select
using (
  student_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "student creates own request" on public.lost_requests;
create policy "student creates own request"
on public.lost_requests for insert
with check (
  student_id = auth.uid()
);

drop policy if exists "admin updates requests" on public.lost_requests;
create policy "admin updates requests"
on public.lost_requests for update
using (
  public.is_admin()
);

-- Policies for found_items
drop policy if exists "anyone signed in sees found items" on public.found_items;
create policy "anyone signed in sees found items"
on public.found_items for select
using (
  auth.uid() is not null
);

drop policy if exists "admin manages found items" on public.found_items;
create policy "admin manages found items"
on public.found_items for all
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

-- Policies for item_matches
drop policy if exists "admin reads matches" on public.item_matches;
create policy "admin reads matches"
on public.item_matches for select
using (
  public.is_admin()
);

drop policy if exists "student reads own matches" on public.item_matches;
create policy "student reads own matches"
on public.item_matches for select
using (
  exists (
    select 1
    from public.lost_requests l
    where l.request_id = item_matches.request_id
      and l.student_id = auth.uid()
  )
);

-- Policies for notifications
drop policy if exists "student reads own notifications" on public.notifications;
create policy "student reads own notifications"
on public.notifications for select
using (
  student_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "admin updates notifications" on public.notifications;
create policy "admin updates notifications"
on public.notifications for update
using (
  public.is_admin()
);

-- ================================================================================
-- STORAGE BUCKET & POLICIES
-- ================================================================================

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

drop policy if exists "signed-in upload photos" on storage.objects;
create policy "signed-in upload photos"
on storage.objects for insert
with check (
  bucket_id = 'item-photos'
  and auth.uid() is not null
);

drop policy if exists "public read photos" on storage.objects;
create policy "public read photos"
on storage.objects for select
using (
  bucket_id = 'item-photos'
);
