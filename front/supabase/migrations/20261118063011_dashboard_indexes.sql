-- Index untuk filter dashboard dan kunci pendaftaran ganda.
-- Rancangan: docs/albana-docs/plans/2026-11-18-dashboard-analytics-implementation-plan.md §1.4
create index if not exists academy_registrations_received_at_idx
  on public.academy_registrations (received_at);
create index if not exists academy_registrations_primary_batch_idx
  on public.academy_registrations (primary_batch_slug);
create index if not exists academy_registrations_email_idx
  on public.academy_registrations (email);
create index if not exists academy_registration_items_batch_idx
  on public.academy_registration_items (batch_slug);
create index if not exists academy_invoices_verified_idx
  on public.academy_invoices (reviewed_at) where status = 'verified';
create index if not exists academy_invoices_pending_idx
  on public.academy_invoices (created_at) where status = 'pending';
