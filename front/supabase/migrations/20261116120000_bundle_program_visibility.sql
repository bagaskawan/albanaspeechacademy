alter table public.bundle_offers
  add column description text,
  add column show_on_speaker boolean not null default true,
  add column show_on_certification boolean not null default true,
  add column placement_scope text not null default 'program'
    check (placement_scope in ('program', 'batch')),
  add column speaker_batch_slug text references public.batches(slug),
  add column certification_batch_slug text references public.batches(slug),
  add constraint bundle_batch_scope check (
    (placement_scope = 'program' and speaker_batch_slug is null and certification_batch_slug is null)
    or (placement_scope = 'batch' and speaker_batch_slug is not null and certification_batch_slug is not null)
  );

-- Batch-scoped offers are stored for later, but the current registration flow only accepts program-scoped offers.
create unique index bundle_one_program_pair on public.bundle_offers
  (least(speaker_program_slug, certification_program_slug), greatest(speaker_program_slug, certification_program_slug))
  where placement_scope = 'program';
