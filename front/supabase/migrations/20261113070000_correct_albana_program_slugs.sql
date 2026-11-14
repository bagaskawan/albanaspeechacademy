create schema if not exists albana_migration_backup;
revoke all on schema albana_migration_backup from public, anon, authenticated;

create table albana_migration_backup.programs_20261113 as
  select * from public.programs where slug in ('basic-to-advance', 'public-speaking-series');
create table albana_migration_backup.batches_20261113 as
  select * from public.batches where program_slug in ('basic-to-advance', 'public-speaking-series');

do $fix$
begin
  if (select count(*) from albana_migration_backup.programs_20261113) <> 2
    or (select count(*) from albana_migration_backup.batches_20261113) <> 2
    or not exists (select 1 from public.programs where slug = 'basic-to-advance' and title = 'Public Speaking Series')
    or not exists (select 1 from public.programs where slug = 'public-speaking-series' and title = 'Public Speaking for Speakers')
    or exists (select 1 from public.programs where slug = 'public-speaking-for-speakers')
    or exists (select 1 from public.members where program_slug in ('basic-to-advance','public-speaking-series'))
    or exists (select 1 from public.transactions where program_slug in ('basic-to-advance','public-speaking-series'))
  then raise exception 'Keadaan katalog berubah; perbaikan slug dibatalkan'; end if;

  update public.programs set slug = 'public-speaking-for-speakers'
    where slug = 'public-speaking-series';
  update public.programs set slug = 'public-speaking-series'
    where slug = 'basic-to-advance';
end
$fix$;
