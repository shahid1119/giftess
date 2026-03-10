-- ============================================================
--  GIFTESS — Complete Supabase SQL Schema
--  Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── 1. Profiles (extends Supabase auth.users) ────────────────
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text,
  email       text,
  phone       text,
  role        text default 'customer',
  created_at  timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, email, phone)
  values (
    new.id,
    new.raw_user_meta_data->>'name',
    new.email,
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 2. Products ───────────────────────────────────────────────
create table if not exists products (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  description    text,
  price          numeric not null,
  original_price numeric,
  category       text,
  sku            text unique,
  badge          text,
  stock          int default 0,
  active         boolean default true,
  images         text[] default '{}',
  created_at     timestamptz default now()
);

-- ── 3. Orders ────────────────────────────────────────────────
create table if not exists orders (
  id               uuid primary key default uuid_generate_v4(),
  order_id         text unique,
  user_id          uuid references profiles(id),
  user_email       text,
  user_name        text,
  items            jsonb,
  subtotal         numeric,
  shipping         numeric default 0,
  total            numeric,
  address          jsonb,
  payment_method   text default 'cod',
  status           text default 'Pending',
  courier_name     text default '',
  tracking_number  text default '',
  tracking_link    text default '',
  created_at       timestamptz default now()
);

-- ── 4. Reviews ───────────────────────────────────────────────
create table if not exists reviews (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid references products(id) on delete cascade,
  user_id     uuid references profiles(id),
  user_name   text,
  rating      int check (rating between 1 and 5),
  comment     text,
  photo_url   text,
  approved    boolean default false,
  created_at  timestamptz default now()
);

-- ── 5. Categories ─────────────────────────────────────────────
create table if not exists categories (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  slug       text unique not null,
  emoji      text,
  "order"    int default 1,
  active     boolean default true,
  created_at timestamptz default now()
);

-- ── 6. Extra Items (Make it Special) ─────────────────────────
create table if not exists extra_items (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  emoji      text,
  price      numeric not null,
  active     boolean default true,
  created_at timestamptz default now()
);

-- ── 7. Free Gifts ─────────────────────────────────────────────
create table if not exists free_gifts (
  id             uuid primary key default uuid_generate_v4(),
  name           text not null,
  emoji          text,
  sku            text,
  original_price numeric,
  active         boolean default true,
  created_at     timestamptz default now()
);

-- ── 8. Hamper Discount Rules ──────────────────────────────────
create table if not exists hamper_discounts (
  id        uuid primary key default uuid_generate_v4(),
  min_items int not null,
  max_items int not null,
  type      text not null check (type in ('flat','percent')),
  value     numeric not null
);

-- ── 9. Website Settings ───────────────────────────────────────
create table if not exists website_settings (
  id                      uuid primary key default uuid_generate_v4(),
  site_name               text default 'Giftess',
  whatsapp                text default '916002698296',
  phone                   text default '+91 6002698296',
  instagram               text default '@gif_tess',
  free_shipping_threshold numeric default 999
);

-- ============================================================
--  ROW LEVEL SECURITY (RLS)
-- ============================================================

alter table profiles         enable row level security;
alter table products         enable row level security;
alter table orders           enable row level security;
alter table reviews          enable row level security;
alter table categories       enable row level security;
alter table extra_items      enable row level security;
alter table free_gifts       enable row level security;
alter table hamper_discounts enable row level security;
alter table website_settings enable row level security;

-- Helper: is admin?
create or replace function is_admin()
returns boolean language sql security definer as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Profiles
create policy "Users read own profile"   on profiles for select using (auth.uid() = id or is_admin());
create policy "Users update own profile" on profiles for update using (auth.uid() = id);
create policy "Users insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Admin reads all profiles" on profiles for select using (is_admin());

-- Products (public read)
create policy "Anyone reads active products" on products for select using (active = true or is_admin());
create policy "Admin manages products"       on products for all using (is_admin());

-- Orders
create policy "Users read own orders"  on orders for select using (user_id = auth.uid() or is_admin());
create policy "Users create orders"    on orders for insert with check (auth.uid() is not null);
create policy "Admin updates orders"   on orders for update using (is_admin());

-- Reviews
create policy "Anyone reads approved reviews" on reviews for select using (approved = true or is_admin());
create policy "Auth users submit reviews"     on reviews for insert with check (auth.uid() is not null);
create policy "Admin manages reviews"         on reviews for all using (is_admin());

-- Public read tables
create policy "Anyone reads categories"    on categories       for select using (true);
create policy "Anyone reads extra_items"   on extra_items      for select using (true);
create policy "Anyone reads free_gifts"    on free_gifts       for select using (true);
create policy "Anyone reads discounts"     on hamper_discounts for select using (true);
create policy "Anyone reads settings"      on website_settings for select using (true);
create policy "Admin manages categories"   on categories       for all using (is_admin());
create policy "Admin manages extra_items"  on extra_items      for all using (is_admin());
create policy "Admin manages free_gifts"   on free_gifts       for all using (is_admin());
create policy "Admin manages discounts"    on hamper_discounts for all using (is_admin());
create policy "Admin manages settings"     on website_settings for all using (is_admin());

-- ============================================================
--  STORAGE BUCKET for product images
--  Run this separately in Supabase Dashboard → Storage
-- ============================================================
-- insert into storage.buckets (id, name, public)
-- values ('product-images', 'product-images', true);

-- create policy "Public read product images"
--   on storage.objects for select using (bucket_id = 'product-images');

-- create policy "Authenticated upload"
--   on storage.objects for insert
--   with check (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ============================================================
--  SEED DATA — Demo Products
-- ============================================================

insert into products (name, description, price, original_price, category, sku, badge, stock, active) values
('Crunch Munch Hamper',    'A delightful hamper filled with premium chocolates, cookies, and crunchy snacks.',  1299, 2399, 'birthday',    'GF34912', 'Sale', 50, true),
('The Birthday Coffer',    'Beautiful birthday box with scented candles, cookies, and a greeting card.',        1199, 2999, 'birthday',    'GF58321', 'New',  30, true),
('Chai Premi Gift Set',    'For the chai lover — premium tea collection, ceramic mug, cookies, and honey.',     1099, 3399, 'gourmet',     'GF72841', null,   40, true),
('You Are Special Box',    'Heartfelt gift box with message card, chocolates, scented candle, and face mask.',  1299, 2399, 'her',         'GF91023', 'Hot',  25, true),
('Valentines Week Hamper', 'Celebrate love all week! Rose petals, chocolates, scented candle and more.',        1799, 4399, 'valentine',   'GF45678', null,   20, true),
('BFF Forever Hamper',     'Perfect gift for your best friend. Scrunchies, face masks, chocolate, and journal.',  999, 1899, 'her',       'GF23456', 'New',  35, true),
('Anniversary Surprise Box','Wine glasses, chocolates, rose petals, and a custom message card.',                2199, 4999, 'anniversary', 'GF67890', null,   15, true),
('Gourmet Delight Hamper', 'Artisan chocolates, imported biscuits, premium coffee, and dried fruits.',         1599, 3199, 'gourmet',     'GF11223', 'Sale', 20, true),
('Self Care Goddess Box',  'Bath bombs, face masks, essential oil roller, lip balm, and scented candle.',       1399, 2799, 'selfcare',    'GF44556', null,   30, true),
('Boss Man Gift Hamper',   'Premium for him — whisky chocolate, premium nuts, cheese crackers, leather keychain.', 1699, 3499, 'him',      'GF77889', null,   18, true);

insert into categories (name, slug, emoji, "order") values
('Birthday Hampers',  'birthday',    '🎂', 1),
('Anniversary Gifts', 'anniversary', '💍', 2),
('Valentine Specials','valentine',   '💕', 3),
('Gifts for Her',     'her',         '👗', 4),
('Gifts for Him',     'him',         '🎩', 5),
('Gourmet Gifts',     'gourmet',     '🍫', 6),
('Self Care',         'selfcare',    '🌸', 7),
('Custom Hamper',     'custom',      '✨', 8);

insert into extra_items (name, emoji, price) values
('Greeting Card',      '💌', 49),
('Chocolate Box',      '🍫', 99),
('Gift Box Upgrade',   '📦', 149),
('Jewelry Pouch',      '💎', 79),
('Custom Message Card','✍️', 39);

insert into free_gifts (name, emoji, sku, original_price) values
('Chocolate Truffle Box', '🍫', 'GF34912', 199),
('Greeting Card Set',     '💌', 'GF58321', 99),
('Scented Candle',        '🕯️', 'GF72841', 249);

insert into hamper_discounts (min_items, max_items, type, value) values
(5, 5,  'flat',    100),
(6, 6,  'flat',    140),
(7, 7,  'percent', 10),
(8, 99, 'percent', 15);

insert into website_settings (site_name, whatsapp, phone, instagram, free_shipping_threshold)
values ('Giftess', '916002698296', '+91 6002698296', '@gif_tess', 999);

-- ============================================================
--  DONE! Your Giftess database is ready.
-- ============================================================
