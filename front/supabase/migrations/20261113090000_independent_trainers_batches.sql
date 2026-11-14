do $drop$
begin
  if exists (select 1 from public.batch_trainers) then
    raise exception 'Penugasan trainer masih berisi data; migrasi dibatalkan';
  end if;
end
$drop$;
drop table public.batch_trainers;
