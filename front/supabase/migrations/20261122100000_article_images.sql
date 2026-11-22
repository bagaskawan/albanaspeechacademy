-- Bucket privat dan metadata gambar artikel, serta RPC transaksional simpan/hapus artikel.

insert into storage.buckets (id, name, public)
values ('article-images', 'article-images', false)
on conflict (id) do update set public = false;

create table if not exists public.article_images (
  id uuid primary key default gen_random_uuid(),
  uploader_id uuid not null,
  article_slug text references public.articles(slug) on update cascade on delete set null,
  profile text not null check (profile in ('thumbnail', 'inline')),
  object_key text not null unique,
  mime_type text not null,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  byte_size integer not null check (byte_size > 0),
  ready_at timestamptz,
  detached_at timestamptz,
  cleanup_claimed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists article_images_article_slug_idx
  on public.article_images (article_slug)
  where article_slug is not null;

create index if not exists article_images_cleanup_idx
  on public.article_images (ready_at, detached_at, created_at)
  where cleanup_claimed_at is null;

alter table public.article_images enable row level security;

revoke all on public.article_images from public, anon, authenticated;
grant all on public.article_images to service_role;

alter table public.articles
  add column if not exists thumbnail_image_id uuid references public.article_images(id) on delete set null;

create or replace function public.save_article_with_images(
  p_slug text,
  p_title text,
  p_excerpt text,
  p_body_blocks jsonb,
  p_body text,
  p_publish boolean,
  p_expected_updated_at timestamptz,
  p_thumbnail_image_id uuid,
  p_inline_image_ids uuid[],
  p_actor_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_inline_ids uuid[] := coalesce(p_inline_image_ids, '{}'::uuid[]);
  v_all_ids uuid[];
  v_existing record;
  v_saved record;
  v_published_at timestamptz;
  v_img record;
  v_found_count integer := 0;
begin
  select coalesce(array_agg(distinct x), '{}'::uuid[])
    into v_all_ids
    from (
      select p_thumbnail_image_id as x where p_thumbnail_image_id is not null
      union all
      select unnest(v_inline_ids) as x
    ) s
   where x is not null;

  if p_slug is not null then
    select slug, published_at, updated_at
      into v_existing
      from public.articles
     where slug = p_slug
       for update;

    if not found then
      return jsonb_build_object('ok', false, 'error_code', 'not_found');
    end if;

    if p_expected_updated_at is not null and v_existing.updated_at <> p_expected_updated_at then
      return jsonb_build_object('ok', false, 'error_code', 'conflict');
    end if;
  end if;

  if coalesce(array_length(v_all_ids, 1), 0) > 0 then
    for v_img in
      select id, uploader_id, article_slug, profile, ready_at, cleanup_claimed_at
        from public.article_images
       where id = any(v_all_ids)
       order by id
         for update
    loop
      v_found_count := v_found_count + 1;
      if v_img.ready_at is null or v_img.cleanup_claimed_at is not null then
        return jsonb_build_object('ok', false, 'error_code', 'invalid_image');
      end if;

      if p_thumbnail_image_id is not null and v_img.id = p_thumbnail_image_id then
        if v_img.profile <> 'thumbnail' then
          return jsonb_build_object('ok', false, 'error_code', 'invalid_image');
        end if;
      end if;

      if v_img.id = any(v_inline_ids) and v_img.profile <> 'inline' then
        return jsonb_build_object('ok', false, 'error_code', 'invalid_image');
      end if;

      if not (
        (v_img.article_slug is null and v_img.uploader_id = p_actor_id)
        or (p_slug is not null and v_img.article_slug = p_slug)
      ) then
        return jsonb_build_object('ok', false, 'error_code', 'invalid_image');
      end if;
    end loop;

    if v_found_count <> array_length(v_all_ids, 1) then
      return jsonb_build_object('ok', false, 'error_code', 'invalid_image');
    end if;
  end if;

  if p_slug is not null then
    v_published_at := case when p_publish then coalesce(v_existing.published_at, v_now) else v_existing.published_at end;
    update public.articles
       set title = p_title,
           excerpt = p_excerpt,
           body_blocks = p_body_blocks,
           body = p_body,
           published = p_publish,
           published_at = v_published_at,
           updated_at = v_now,
           thumbnail_image_id = p_thumbnail_image_id
     where slug = p_slug
     returning slug, updated_at, published_at into v_saved;
  else
    v_published_at := case when p_publish then v_now else null end;
    insert into public.articles (title, excerpt, body_blocks, body, published, published_at, updated_at, thumbnail_image_id)
    values (p_title, p_excerpt, p_body_blocks, p_body, p_publish, v_published_at, v_now, p_thumbnail_image_id)
    returning slug, updated_at, published_at into v_saved;
  end if;

  if coalesce(array_length(v_all_ids, 1), 0) > 0 then
    update public.article_images
       set article_slug = v_saved.slug,
           detached_at = null
     where id = any(v_all_ids);
  end if;

  update public.article_images
     set detached_at = coalesce(detached_at, v_now)
   where article_slug = v_saved.slug
     and (coalesce(array_length(v_all_ids, 1), 0) = 0 or not (id = any(v_all_ids)));

  return jsonb_build_object(
    'ok', true,
    'slug', v_saved.slug,
    'updated_at', v_saved.updated_at,
    'published_at', v_saved.published_at
  );
end;
$$;

create or replace function public.set_article_published_status(
  p_slug text,
  p_publish boolean,
  p_expected_updated_at timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_existing record;
  v_saved record;
begin
  select slug, published_at, updated_at
    into v_existing
    from public.articles
   where slug = p_slug
     for update;

  if not found then
    return jsonb_build_object('ok', false, 'error_code', 'not_found');
  end if;

  if p_expected_updated_at is not null and v_existing.updated_at <> p_expected_updated_at then
    return jsonb_build_object('ok', false, 'error_code', 'conflict');
  end if;

  update public.articles
     set published = p_publish,
         published_at = case when p_publish then coalesce(v_existing.published_at, v_now) else v_existing.published_at end,
         updated_at = v_now
   where slug = p_slug
   returning slug, updated_at, published_at into v_saved;

  return jsonb_build_object(
    'ok', true,
    'slug', v_saved.slug,
    'updated_at', v_saved.updated_at,
    'published_at', v_saved.published_at
  );
end;
$$;

create or replace function public.delete_article_with_images(p_slug text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_slug text;
begin
  select slug into v_slug from public.articles where slug = p_slug for update;
  if not found then
    return false;
  end if;

  update public.article_images
     set detached_at = coalesce(detached_at, v_now),
         article_slug = null
   where article_slug = p_slug;

  delete from public.articles where slug = p_slug;
  return true;
end;
$$;

revoke execute on function public.save_article_with_images(text, text, text, jsonb, text, boolean, timestamptz, uuid, uuid[], uuid) from public, anon, authenticated;
grant execute on function public.save_article_with_images(text, text, text, jsonb, text, boolean, timestamptz, uuid, uuid[], uuid) to service_role;

revoke execute on function public.set_article_published_status(text, boolean, timestamptz) from public, anon, authenticated;
grant execute on function public.set_article_published_status(text, boolean, timestamptz) to service_role;

revoke execute on function public.delete_article_with_images(text) from public, anon, authenticated;
grant execute on function public.delete_article_with_images(text) to service_role;
