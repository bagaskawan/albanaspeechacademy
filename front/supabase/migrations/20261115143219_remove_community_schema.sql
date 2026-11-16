-- Retire the community schema after the Albana routes switch to admin_users
-- and academy_registrations. Abort if any legacy transactional content appeared.
do $$
declare
  table_name text;
  row_count bigint;
begin
  foreach table_name in array array[
    'contact_details', 'trainer_contacts', 'sessions', 'payments',
    'gallery_albums', 'vouchers', 'landing_sections', 'transactions',
    'referral_codes', 'partners', 'team_members', 'wa_group_assignments',
    'media_library', 'admin_activity_logs', 'admin_roles',
    'admin_role_permissions', 'registrations'
  ] loop
    execute format('select count(*) from public.%I', table_name) into row_count;
    if row_count <> 0 then
      raise exception 'Cannot retire %. It contains % rows.', table_name, row_count;
    end if;
  end loop;

  if exists (
    select 1 from public.members m
    left join public.admin_users a on a.user_id = m.id
    where a.user_id is null
  ) then
    raise exception 'Cannot retire members while non-admin member rows exist.';
  end if;
end;
$$;

drop trigger if exists testimonials_set_attribution on public.testimonials;
drop function if exists public.testimonials_set_attribution();
alter table public.testimonials drop column if exists member_id;

drop function if exists public.get_email_by_username(text);
drop function if exists public.receive_registration(text, bigint, jsonb, boolean);

drop table public.admin_role_permissions;
drop table public.admin_roles;
drop table public.admin_activity_logs;
drop table public.media_library;
drop table public.wa_group_assignments;
drop table public.referral_codes;
drop table public.transactions;
drop table public.vouchers;
drop table public.payments;
drop table public.registrations;
drop table public.sessions;
drop table public.gallery_albums;
drop table public.landing_sections;
drop table public.partners;
drop table public.team_members;
drop table public.trainer_contacts;
drop table public.contact_details;
drop table public.intake_key;
drop table public.privilege_items;
drop table public.privilege_actions;
drop table public.privilege_groups;
drop table public.members;
