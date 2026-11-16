-- These columns have no active reader/writer after the community CMS sidebar
-- is retired. Abort if content was added after the audit.
do $$
begin
  if exists (select 1 from public.academy) or exists (select 1 from public.testimonials) then
    raise exception 'Review academy/testimonials data before dropping unused columns.';
  end if;
end;
$$;

alter table public.academy drop column hidden_admin_modules;
alter table public.testimonials
  drop column result_highlight,
  drop column is_featured,
  drop column order_index;
