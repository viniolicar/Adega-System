-- ====================================================
-- ADEGA SYSTEM — passo 1: estrutura inicial do banco (Supabase)
-- ====================================================
-- ATENÇÃO: as tabelas são criadas só se ainda não existirem, mas as regras
-- de segurança (create policy) não. Rodar este arquivo de novo num banco que já
-- foi configurado dá o erro "policy already exists" (é inofensivo).


-- 1) PROFILES: dados do funcionário, ligados ao login (auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  role text not null default 'funcionario' check (role in ('funcionario','administrador')),
  status text not null default 'ativo' check (status in ('ativo','inativo')),
  created_at timestamptz not null default now()
);

-- 2) PRODUCTS: catálogo e estoque
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric(10,2) not null,
  stock integer not null default 0,
  created_at timestamptz not null default now()
);

-- 3) ORDERS: pedidos
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  customer_name text not null,
  employee_id uuid references public.profiles(id),
  status text not null default 'Finalizado',
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 4) ORDER_ITEMS: itens de cada pedido
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id),
  name text not null,
  category text,
  price numeric(10,2) not null,
  quantity integer not null,
  subtotal numeric(10,2) not null
);

-- ====================================================
-- Criação automática de "profile" quando um funcionário novo
-- é cadastrado (Authentication > Users > Add user)
-- ====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, nome, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'funcionario'),
    'ativo'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ====================================================
-- Função que ajusta o estoque de forma ATÔMICA (evita a
-- corrida de dois funcionários vendendo o último item ao
-- mesmo tempo). p_delta positivo = descontar; negativo = devolver.
-- ====================================================
create or replace function public.adjust_stock(p_product_id uuid, p_delta integer)
returns boolean
language plpgsql
security definer
as $$
declare
  updated_rows integer;
begin
  update public.products
  set stock = stock - p_delta
  where id = p_product_id and (p_delta <= 0 or stock >= p_delta);
  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$;

-- ====================================================
-- SEGURANÇA: ativa RLS (Row Level Security) em todas as
-- tabelas e define quem pode ver/alterar o quê.
-- ====================================================
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- PROFILES: qualquer funcionário logado pode ver todos os perfis
-- (útil para mostrar quem criou cada pedido), mas só pode editar
-- o PRÓPRIO perfil.
create policy "profiles_select_all" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- PRODUCTS: qualquer funcionário logado pode ver o catálogo.
-- Só ADMINISTRADOR pode criar, editar ou excluir produtos.
create policy "products_select_all" on public.products
  for select using (auth.role() = 'authenticated');
create policy "products_insert_admin" on public.products
  for insert with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );
create policy "products_update_admin" on public.products
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );
create policy "products_delete_admin" on public.products
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'administrador')
  );

-- ORDERS / ORDER_ITEMS: qualquer funcionário logado pode ver,
-- criar, editar e excluir pedidos (igual ao comportamento atual
-- do sistema, sem restrição de dono do pedido).
create policy "orders_all_authenticated" on public.orders
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "order_items_all_authenticated" on public.order_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
