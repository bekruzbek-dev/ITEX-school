-- ITEX 🚀 — 002: Row Level Security. Qayta ishga tushirish xavfsiz (siyosatlar qayta yaratiladi).

-- Administrator tekshiruvi: faqat admin_users jadvaliga asoslanadi (JWT ichidagi foydalanuvchi yuborgan ma'lumotga emas).
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admin_users   enable row level security;
alter table public.courses       enable row level security;
alter table public.applications  enable row level security;
alter table public.news          enable row level security;
alter table public.projects      enable row level security;
alter table public.achievements  enable row level security;
alter table public.site_settings enable row level security;

-- admin_users: foydalanuvchi faqat o'z qatorini ko'ra oladi; yozish faqat SQL Editor orqali (service role).
drop policy if exists admin_users_select_self on public.admin_users;
create policy admin_users_select_self on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- Ochiq kontent: faqat e'lon qilinganlar o'qiladi, admin hammasini ko'radi va boshqaradi.
do $$
declare t text;
begin
  foreach t in array array['courses','news','projects','achievements'] loop
    execute format('drop policy if exists %1$s_public_read on public.%1$s', t);
    execute format('create policy %1$s_public_read on public.%1$s for select to anon, authenticated
                    using (is_published = true or public.is_admin())', t);
    execute format('drop policy if exists %1$s_admin_insert on public.%1$s', t);
    execute format('create policy %1$s_admin_insert on public.%1$s for insert to authenticated
                    with check (public.is_admin())', t);
    execute format('drop policy if exists %1$s_admin_update on public.%1$s', t);
    execute format('create policy %1$s_admin_update on public.%1$s for update to authenticated
                    using (public.is_admin()) with check (public.is_admin())', t);
    execute format('drop policy if exists %1$s_admin_delete on public.%1$s', t);
    execute format('create policy %1$s_admin_delete on public.%1$s for delete to authenticated
                    using (public.is_admin())', t);
  end loop;
end $$;

-- site_settings: hamma o'qiydi, faqat admin yangilaydi
drop policy if exists settings_public_read on public.site_settings;
create policy settings_public_read on public.site_settings for select to anon, authenticated using (true);
drop policy if exists settings_admin_insert on public.site_settings;
create policy settings_admin_insert on public.site_settings for insert to authenticated with check (public.is_admin());
drop policy if exists settings_admin_update on public.site_settings;
create policy settings_admin_update on public.site_settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- applications: ommaviy foydalanuvchi faqat YARATA oladi (status doim 'new', rozilik majburiy), O'QIY OLMAYDI.
drop policy if exists applications_public_insert on public.applications;
create policy applications_public_insert on public.applications for insert to anon, authenticated
  with check (status = 'new' and consent = true);
drop policy if exists applications_admin_select on public.applications;
create policy applications_admin_select on public.applications for select to authenticated using (public.is_admin());
drop policy if exists applications_admin_update on public.applications;
create policy applications_admin_update on public.applications for update to authenticated
  using (public.is_admin()) with check (public.is_admin());
drop policy if exists applications_admin_delete on public.applications;
create policy applications_admin_delete on public.applications for delete to authenticated using (public.is_admin());

-- Ruxsatlarni qat'iylashtirish
revoke all on public.admin_users from anon;
revoke all on public.applications from anon;
grant insert on public.applications to anon;
