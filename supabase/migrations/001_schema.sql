-- ITEX 🚀 — 001: jadvallar. Qayta ishga tushirilsa mavjud ma'lumotlar o'chmaydi (IF NOT EXISTS).
create extension if not exists pgcrypto;

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- Administratorlar (auth.users bilan bog'langan). Foydalanuvchi o'zi qo'sha olmaydi.
create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 120),
  description text not null default '',
  level text not null default 'Barcha sinflar',
  topics text[] not null default '{}',
  practice text[] not null default '{}',
  duration text,
  schedule text,
  icon text not null default '💻',
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 3 and 120),
  grade text not null check (char_length(grade) between 1 and 20),
  school_name text check (school_name is null or char_length(school_name) <= 160),
  phone text not null check (phone ~ '^\+998[0-9]{9}$'),
  parent_phone text check (parent_phone is null or parent_phone ~ '^\+998[0-9]{9}$'),
  course_id uuid references public.courses(id) on delete set null,
  course_title text,
  computer_level text not null default 'boshlang''ich'
    check (computer_level in ('boshlang''ich','o''rta','yuqori')),
  comment text check (comment is null or char_length(comment) <= 1000),
  consent boolean not null check (consent = true),
  status text not null default 'new'
    check (status in ('new','reviewing','accepted','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists applications_status_idx on public.applications(status);
create index if not exists applications_created_idx on public.applications(created_at desc);
create index if not exists applications_phone_idx on public.applications(phone, created_at desc);

create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  summary text not null default '',
  content text not null default '',
  category text not null default 'Yangilik',
  image_url text,
  is_published boolean not null default true,
  published_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists news_pub_idx on public.news(is_published, published_at desc);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 160),
  author text not null default '',
  description text not null default '',
  image_url text,
  technologies text[] not null default '{}',
  project_date date,
  demo_url text,
  github_url text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_pub_idx on public.projects(is_published, created_at desc);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 3 and 200),
  description text not null default '',
  category text not null default 'Tanlov',
  image_url text,
  achievement_date date,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists achievements_pub_idx on public.achievements(is_published, achievement_date desc);

-- Bitta qatorli sozlamalar jadvali (id = 1)
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  phone text,
  email text,
  telegram_url text,
  address text not null default 'Andijon viloyati, Baliqchi tumani, Barkamol MFY',
  map_embed_url text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

do $$
declare t text;
begin
  foreach t in array array['courses','applications','news','projects','achievements','site_settings'] loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s
                    for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- Spamga qarshi: bir telefon raqamidan 24 soatda 3 tadan ortiq ariza qabul qilinmaydi,
-- bir xil raqam + yo'nalish takrorlanmaydi.
create or replace function public.limit_application_spam() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if (select count(*) from public.applications
      where phone = new.phone and created_at > now() - interval '24 hours') >= 3 then
    raise exception 'RATE_LIMIT' using errcode = 'P0001';
  end if;
  if new.course_id is not null and exists (
      select 1 from public.applications
      where phone = new.phone and course_id = new.course_id
        and status in ('new','reviewing','accepted')) then
    raise exception 'DUPLICATE' using errcode = 'P0001';
  end if;
  if new.course_id is not null then
    select title into new.course_title from public.courses where id = new.course_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_applications_spam on public.applications;
create trigger trg_applications_spam before insert on public.applications
  for each row execute function public.limit_application_spam();
