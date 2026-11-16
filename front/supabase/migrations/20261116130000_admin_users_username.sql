-- Admin login name (plan 3.7 follow-up): unique, lowercase, used by the CMS login and account menu.
-- Values are set per account outside migrations so no email address is stored in the repository.
alter table public.admin_users add column if not exists username text;
alter table public.admin_users drop constraint if exists admin_users_username_format;
alter table public.admin_users add constraint admin_users_username_format
  check (username is null or username ~ '^[a-z0-9][a-z0-9._-]{2,31}$');
create unique index if not exists admin_users_username_key on public.admin_users (username);
