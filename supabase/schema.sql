-- =====================================================================
-- STOP BURGER ERIK · Esquema de base de datos (Supabase / PostgreSQL)
-- Ejecutar completo en: Supabase -> SQL Editor -> New query -> Run
-- Es idempotente: se puede volver a ejecutar sin romper datos existentes.
-- =====================================================================

-- ---------- Utilidades ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ---------- Administradores ----------
-- No hay registro público. Los administradores se agregan manualmente
-- (ver supabase/create_admin.sql).
create table if not exists public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  email      text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- ---------- Categorías ----------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text,
  emoji       text,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists categories_sort_idx on public.categories (sort_order);

-- ---------- Productos ----------
create table if not exists public.products (
  id           uuid primary key default gen_random_uuid(),
  category_id  uuid not null references public.categories (id) on delete restrict,
  name         text not null check (char_length(btrim(name)) between 1 and 120),
  description  text,
  price        integer not null check (price >= 0),          -- pesos colombianos (COP)
  image_url    text,
  image_path   text,                                          -- ruta en Storage (para poder borrar)
  is_available boolean not null default true,
  is_featured  boolean not null default false,
  sort_order   integer not null default 0,
  needs_review boolean not null default false,                -- dato dudoso en el menú original
  review_note  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique (category_id, name)
);
create index if not exists products_category_sort_idx on public.products (category_id, sort_order);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured;
create index if not exists products_review_idx on public.products (needs_review) where needs_review;

-- ---------- Información del negocio (una sola fila) ----------
create table if not exists public.business_info (
  id                smallint primary key default 1 check (id = 1),
  name              text not null default 'STOP BURGER ERIK',
  tagline           text,
  short_description text,
  long_description  text,
  phone             text,
  whatsapp          text,            -- formato internacional sin "+" (573176363783)
  address           text,
  neighborhood      text,
  city              text,
  department        text,
  country           text default 'Colombia',
  logo_url          text,
  logo_path         text,
  hero_image_url    text,
  hero_image_path   text,
  rating            numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  rating_source     text default 'Google',
  show_rating       boolean not null default true,
  updated_at        timestamptz not null default now()
);

-- ---------- Configuración del sitio / pedidos (una sola fila) ----------
create table if not exists public.site_settings (
  id             smallint primary key default 1 check (id = 1),
  accept_orders  boolean not null default true,
  closed_message text,
  order_greeting text,
  order_closing  text,
  delivery_note  text,
  updated_at     timestamptz not null default now()
);

-- ---------- Ubicaciones (preparado para varias sucursales) ----------
create table if not exists public.locations (
  id           uuid primary key default gen_random_uuid(),
  name         text not null check (char_length(btrim(name)) > 0),
  address      text not null,
  neighborhood text,
  city         text,
  department   text,
  phone        text,
  hours_text   text,                                  -- texto libre opcional
  latitude     numeric(9,6) check (latitude  is null or latitude  between -90  and 90),
  longitude    numeric(9,6) check (longitude is null or longitude between -180 and 180),
  maps_url     text,
  is_active    boolean not null default true,
  sort_order   integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ---------- Horarios ----------
-- location_id NULL = horario general del negocio.
-- day_of_week: 0 = domingo ... 6 = sábado (igual que JavaScript).
-- slots: [{"open":"16:00","close":"01:30"}]. Si close < open la franja cruza la medianoche.
create table if not exists public.business_hours (
  id          uuid primary key default gen_random_uuid(),
  location_id uuid references public.locations (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  is_closed   boolean not null default false,
  slots       jsonb not null default '[]'::jsonb check (jsonb_typeof(slots) = 'array'),
  updated_at  timestamptz not null default now()
);
create unique index if not exists business_hours_unique_idx
  on public.business_hours (coalesce(location_id, '00000000-0000-0000-0000-000000000000'::uuid), day_of_week);

-- ---------- Galería ----------
create table if not exists public.gallery (
  id         uuid primary key default gen_random_uuid(),
  image_url  text not null,
  image_path text not null,
  caption    text,
  is_primary boolean not null default false,
  is_active  boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
create unique index if not exists gallery_one_primary_idx on public.gallery (is_primary) where is_primary;
create index if not exists gallery_sort_idx on public.gallery (sort_order);

-- ---------- Redes sociales ----------
create table if not exists public.social_links (
  platform   text primary key check (platform in ('facebook','instagram','tiktok','whatsapp','google_maps')),
  url        text,
  is_active  boolean not null default true,
  updated_at timestamptz not null default now()
);

-- ---------- Triggers updated_at ----------
do $$
declare t text;
begin
  foreach t in array array['categories','products','business_info','site_settings','locations','business_hours','social_links']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on public.%1$s', t);
    execute format('create trigger trg_%1$s_updated before update on public.%1$s for each row execute function public.set_updated_at()', t);
  end loop;
end $$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- Público (anon): solo LEE información pública.
-- Administrador (is_admin()): lee y modifica todo.
-- =====================================================================
alter table public.admin_users    enable row level security;
alter table public.categories     enable row level security;
alter table public.products       enable row level security;
alter table public.business_info  enable row level security;
alter table public.site_settings  enable row level security;
alter table public.locations      enable row level security;
alter table public.business_hours enable row level security;
alter table public.gallery        enable row level security;
alter table public.social_links   enable row level security;

-- Permisos de tabla explícitos (RLS decide qué filas).
revoke all on public.admin_users, public.categories, public.products, public.business_info, public.site_settings,
              public.locations, public.business_hours, public.gallery, public.social_links from anon, authenticated;
grant select on public.categories, public.products, public.business_info, public.site_settings,
                public.locations, public.business_hours, public.gallery, public.social_links to anon, authenticated;
grant insert, update, delete on public.categories, public.products, public.business_info, public.site_settings,
                public.locations, public.business_hours, public.gallery, public.social_links to authenticated;
grant select on public.admin_users to authenticated;

-- admin_users: cada usuario solo puede ver su propia fila. Sin escritura desde la API.
drop policy if exists "admin_users: ver propia fila" on public.admin_users;
create policy "admin_users: ver propia fila" on public.admin_users
  for select to authenticated using (user_id = auth.uid());

-- categories
drop policy if exists "categories: lectura pública" on public.categories;
create policy "categories: lectura pública" on public.categories
  for select to anon, authenticated using (is_active);
drop policy if exists "categories: admin total" on public.categories;
create policy "categories: admin total" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- products (se ven los agotados, pero no los de categorías inactivas)
drop policy if exists "products: lectura pública" on public.products;
create policy "products: lectura pública" on public.products
  for select to anon, authenticated
  using (exists (select 1 from public.categories c where c.id = category_id and c.is_active));
drop policy if exists "products: admin total" on public.products;
create policy "products: admin total" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- business_info / site_settings
drop policy if exists "business_info: lectura pública" on public.business_info;
create policy "business_info: lectura pública" on public.business_info
  for select to anon, authenticated using (true);
drop policy if exists "business_info: admin total" on public.business_info;
create policy "business_info: admin total" on public.business_info
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "site_settings: lectura pública" on public.site_settings;
create policy "site_settings: lectura pública" on public.site_settings
  for select to anon, authenticated using (true);
drop policy if exists "site_settings: admin total" on public.site_settings;
create policy "site_settings: admin total" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- locations
drop policy if exists "locations: lectura pública" on public.locations;
create policy "locations: lectura pública" on public.locations
  for select to anon, authenticated using (is_active);
drop policy if exists "locations: admin total" on public.locations;
create policy "locations: admin total" on public.locations
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- business_hours
drop policy if exists "business_hours: lectura pública" on public.business_hours;
create policy "business_hours: lectura pública" on public.business_hours
  for select to anon, authenticated using (true);
drop policy if exists "business_hours: admin total" on public.business_hours;
create policy "business_hours: admin total" on public.business_hours
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- gallery
drop policy if exists "gallery: lectura pública" on public.gallery;
create policy "gallery: lectura pública" on public.gallery
  for select to anon, authenticated using (is_active);
drop policy if exists "gallery: admin total" on public.gallery;
create policy "gallery: admin total" on public.gallery
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- social_links
drop policy if exists "social_links: lectura pública" on public.social_links;
create policy "social_links: lectura pública" on public.social_links
  for select to anon, authenticated using (is_active);
drop policy if exists "social_links: admin total" on public.social_links;
create policy "social_links: admin total" on public.social_links
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =====================================================================
-- STORAGE: bucket público "media" (products/, gallery/, branding/)
-- Solo JPG/PNG/WEBP, máximo 5 MB. Lectura pública por URL; escritura solo admin.
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "media: admin lee" on storage.objects;
create policy "media: admin lee" on storage.objects
  for select to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin sube" on storage.objects;
create policy "media: admin sube" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin actualiza" on storage.objects;
create policy "media: admin actualiza" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and public.is_admin())
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media: admin borra" on storage.objects;
create policy "media: admin borra" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- =====================================================================
-- Escalabilidad futura (no implementado aún, pero la estructura lo permite):
--  * pedidos internos / estados:   tablas orders + order_items (product_id, price snapshot)
--  * extras / tamaños:             product_options + product_option_values
--  * combos / promos / cupones:    tablas propias que referencian products
--  * sucursales:                   locations + business_hours.location_id ya existen
-- =====================================================================
