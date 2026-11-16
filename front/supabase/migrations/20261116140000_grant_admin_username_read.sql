-- admin_self restricts rows to the signed-in admin; grant the account-menu column separately.
grant select (username) on public.admin_users to authenticated;
