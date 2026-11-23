-- Log aktivitas admin (CRUD) & paritas hak akses hapus untuk role 'admin'
create table if not exists public.admin_activity_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid not null,
  actor_username text not null,
  actor_role text not null,
  action text not null check (action in ('create', 'update', 'delete', 'verify', 'reject', 'status', 'password')),
  module text not null,
  entity_id text,
  entity_label text,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_activity_logs_created_at_idx
  on public.admin_activity_logs (created_at desc);

create index if not exists admin_activity_logs_module_idx
  on public.admin_activity_logs (module, created_at desc);

alter table public.admin_activity_logs enable row level security;

create policy admin_activity_logs_superadmin_select
  on public.admin_activity_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
        and a.role = 'adminsuper'
    )
  );

create policy admin_activity_logs_admin_insert
  on public.admin_activity_logs
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );

-- Buka hak DELETE untuk seluruh admin (baik 'admin' maupun 'adminsuper')
alter policy cms_admin_delete on public.academy
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );

alter policy cms_admin_delete on public.bank_accounts
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );

alter policy cms_admin_delete on public.media_assets
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );

alter policy cms_admin_delete on public.testimonials
  using (
    exists (
      select 1
      from public.admin_users a
      where a.user_id = auth.uid()
    )
  );
