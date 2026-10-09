-- IngreCheck Phase 2 user data.
-- Run this once in the Supabase SQL Editor for your project.
-- Statements use IF NOT EXISTS or DROP POLICY IF EXISTS so a second run is safe.

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scan_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  barcode text not null,
  product_name text,
  brand text,
  image_url text,
  scanned_at timestamptz not null default now(),
  constraint scan_history_barcode_not_blank check (char_length(trim(barcode)) > 0)
);

create index if not exists scan_history_user_scanned_idx
  on public.scan_history (user_id, scanned_at desc);

create index if not exists scan_history_user_barcode_idx
  on public.scan_history (user_id, barcode);

create table if not exists public.favorite_products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  barcode text not null,
  product_name text,
  brand text,
  image_url text,
  created_at timestamptz not null default now(),
  constraint favorite_products_barcode_not_blank check (char_length(trim(barcode)) > 0),
  constraint favorite_products_user_barcode_unique unique (user_id, barcode)
);

create index if not exists favorite_products_user_created_idx
  on public.favorite_products (user_id, created_at desc);

create table if not exists public.ingredient_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  ingredient_name text not null,
  preference_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ingredient_preferences_type_check check (preference_type in ('avoid', 'monitor')),
  constraint ingredient_preferences_name_not_blank check (char_length(trim(ingredient_name)) > 0),
  constraint ingredient_preferences_unique unique (user_id, ingredient_name, preference_type)
);

create index if not exists ingredient_preferences_user_idx
  on public.ingredient_preferences (user_id, updated_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    nullif(
      trim(coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', '')),
      ''
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists ingredient_preferences_set_updated_at on public.ingredient_preferences;
create trigger ingredient_preferences_set_updated_at
  before update on public.ingredient_preferences
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.scan_history enable row level security;
alter table public.favorite_products enable row level security;
alter table public.ingredient_preferences enable row level security;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists scan_history_select_own on public.scan_history;
create policy scan_history_select_own on public.scan_history
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists scan_history_insert_own on public.scan_history;
create policy scan_history_insert_own on public.scan_history
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists scan_history_delete_own on public.scan_history;
create policy scan_history_delete_own on public.scan_history
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists favorite_products_select_own on public.favorite_products;
create policy favorite_products_select_own on public.favorite_products
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists favorite_products_insert_own on public.favorite_products;
create policy favorite_products_insert_own on public.favorite_products
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists favorite_products_delete_own on public.favorite_products;
create policy favorite_products_delete_own on public.favorite_products
  for delete to authenticated
  using (user_id = auth.uid());

drop policy if exists ingredient_preferences_select_own on public.ingredient_preferences;
create policy ingredient_preferences_select_own on public.ingredient_preferences
  for select to authenticated
  using (user_id = auth.uid());

drop policy if exists ingredient_preferences_insert_own on public.ingredient_preferences;
create policy ingredient_preferences_insert_own on public.ingredient_preferences
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists ingredient_preferences_update_own on public.ingredient_preferences;
create policy ingredient_preferences_update_own on public.ingredient_preferences
  for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists ingredient_preferences_delete_own on public.ingredient_preferences;
create policy ingredient_preferences_delete_own on public.ingredient_preferences
  for delete to authenticated
  using (user_id = auth.uid());

grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.scan_history to authenticated;
grant select, insert, delete on public.favorite_products to authenticated;
grant select, insert, update, delete on public.ingredient_preferences to authenticated;

-- Deletes only the signed-in auth user. Related rows cascade.
-- The SQL Editor role can create this. Do not call it with a service-role key from the app.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
