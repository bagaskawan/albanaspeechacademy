-- Satu batch aktif per program; batch baru otomatis menggantikan yang lama.
alter table public.batches add column if not exists is_active boolean not null default false;

-- Backfill: pilih batch dengan sesi terakhir paling baru sebagai batch aktif.
update public.batches b
set is_active = true
from (
  select distinct on (program_slug) slug
  from public.batches
  order by program_slug,
           coalesce((select max(s->>'starts_at') from jsonb_array_elements(sessions) s), '') desc,
           slug desc
) pick
where b.slug = pick.slug;

create unique index if not exists batches_one_active_per_program
  on public.batches (program_slug) where is_active;

create or replace function public.enforce_single_active_batch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.is_active := true;
  end if;

  if new.is_active then
    update public.batches
       set is_active = false
     where program_slug = new.program_slug
       and slug is distinct from new.slug
       and is_active;
  end if;

  return new;
end;
$$;

drop trigger if exists batches_single_active on public.batches;
create trigger batches_single_active
before insert or update of is_active, program_slug on public.batches
for each row execute function public.enforce_single_active_batch();

-- Memindahkan batch aktif ke program lain tidak boleh menyisakan program lama tanpa batch aktif.
create or replace function public.reactivate_old_program_batch()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.program_slug is distinct from new.program_slug
     and old.is_active
     and not exists (
       select 1 from public.batches
       where program_slug = old.program_slug and is_active
     )
  then
    update public.batches
       set is_active = true
     where slug = (
       select slug from public.batches
       where program_slug = old.program_slug
       order by coalesce((select max(s->>'starts_at') from jsonb_array_elements(sessions) s), '') desc,
                slug desc
       limit 1
     );
  end if;
  return null;
end;
$$;

drop trigger if exists batches_reactivate_old_program on public.batches;
create trigger batches_reactivate_old_program
after update of program_slug on public.batches
for each row execute function public.reactivate_old_program_batch();
