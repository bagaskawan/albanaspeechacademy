-- Regenerate program slug from its title whenever the title changes.
create or replace function public.sync_program_slug()
returns trigger
language plpgsql
set search_path to 'public'
as $$
declare
  base text;
  candidate text;
  suffix int := 1;
  taken boolean;
begin
  if new.title is not distinct from old.title then
    return new;
  end if;

  base := btrim(
    regexp_replace(lower(coalesce(new.title, '')), '[^a-z0-9]+', '-', 'g'),
    '-'
  );
  if base = '' then
    base := 'item';
  end if;

  candidate := base;
  loop
    execute 'select exists (select 1 from public.programs where slug = $1 and slug <> $2)'
      into taken using candidate, old.slug;
    exit when not taken;
    candidate := base || '-' || suffix;
    suffix := suffix + 1;
  end loop;

  new.slug := candidate;
  return new;
end;
$$;

drop trigger if exists sync_program_slug on public.programs;
create trigger sync_program_slug
before update of title on public.programs
for each row execute function public.sync_program_slug();

-- Let slug changes propagate to dependent rows instead of failing the update.
alter table public.batches drop constraint if exists batches_program_slug_fkey;
alter table public.batches add constraint batches_program_slug_fkey
  foreign key (program_slug) references public.programs(slug) on update cascade;

alter table public.members drop constraint if exists members_program_slug_fkey;
alter table public.members add constraint members_program_slug_fkey
  foreign key (program_slug) references public.programs(slug) on update cascade;

alter table public.transactions drop constraint if exists transactions_program_slug_fkey;
alter table public.transactions add constraint transactions_program_slug_fkey
  foreign key (program_slug) references public.programs(slug) on update cascade;
