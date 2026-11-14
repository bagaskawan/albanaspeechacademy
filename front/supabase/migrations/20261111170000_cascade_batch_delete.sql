-- Hapus batch ikut membersihkan data turunannya secara atomik.
alter table public.registrations
  drop constraint registrations_batch_slug_fkey,
  add constraint registrations_batch_slug_fkey
    foreign key (batch_slug) references public.batches(slug) on delete cascade;

alter table public.sessions
  drop constraint sessions_batch_slug_fkey,
  add constraint sessions_batch_slug_fkey
    foreign key (batch_slug) references public.batches(slug) on delete cascade;

alter table public.batch_trainers
  drop constraint batch_trainers_batch_slug_fkey,
  add constraint batch_trainers_batch_slug_fkey
    foreign key (batch_slug) references public.batches(slug) on delete cascade;

alter table public.gallery_albums
  drop constraint gallery_albums_batch_slug_fkey,
  add constraint gallery_albums_batch_slug_fkey
    foreign key (batch_slug) references public.batches(slug) on delete cascade;

alter table public.payments
  drop constraint payments_registration_id_fkey,
  add constraint payments_registration_id_fkey
    foreign key (registration_id) references public.registrations(id) on delete cascade;
