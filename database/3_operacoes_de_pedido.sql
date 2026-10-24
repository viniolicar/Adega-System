-- ====================================================
-- ADEGA SYSTEM — passo 3: operações atômicas de pedido (criar / editar / excluir)
-- ====================================================
-- Cada uma dessas funções faz TUDO dentro de uma única transação:
-- se qualquer parte falhar (ex: estoque insuficiente), o banco desfaz
-- automaticamente tudo o que já tinha sido feito naquela chamada —
-- nunca fica um pedido "pela metade" ou um estoque incoerente.

-- CRIAR PEDIDO
create or replace function public.create_order(
  p_customer_name text,
  p_employee_id uuid,
  p_items jsonb
)
returns table(order_id uuid, order_code text)
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_code text;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_updated integer;
begin
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_total := v_total + (v_item->>'price')::numeric * (v_item->>'quantity')::integer;
  end loop;

  insert into public.orders (customer_name, employee_id, total)
  values (p_customer_name, p_employee_id, v_total)
  returning id, code into v_order_id, v_code;

  for v_item in select * from jsonb_array_elements(p_items) loop
    update public.products
    set stock = stock - (v_item->>'quantity')::integer
    where id = (v_item->>'productId')::uuid
      and stock >= (v_item->>'quantity')::integer;
    get diagnostics v_updated = row_count;
    if v_updated = 0 then
      raise exception 'Estoque insuficiente para %', (v_item->>'name');
    end if;

    insert into public.order_items (order_id, product_id, name, category, price, quantity, subtotal)
    values (
      v_order_id,
      (v_item->>'productId')::uuid,
      v_item->>'name',
      v_item->>'category',
      (v_item->>'price')::numeric,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric * (v_item->>'quantity')::integer
    );
  end loop;

  return query select v_order_id, v_code;
end;
$$;

-- EDITAR PEDIDO (ajusta o estoque só pela DIFERENÇA)
create or replace function public.update_order(
  p_order_code text,
  p_customer_name text,
  p_items jsonb
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_updated integer;
  v_original record;
  orig_qty_map jsonb := '{}'::jsonb;
  new_qty_map jsonb := '{}'::jsonb;
  v_key text;
  v_delta integer;
  v_product_id uuid;
begin
  select id into v_order_id from public.orders where code = p_order_code;
  if v_order_id is null then
    raise exception 'Pedido não encontrado';
  end if;

  for v_original in select product_id, quantity from public.order_items where order_id = v_order_id loop
    orig_qty_map := jsonb_set(
      orig_qty_map, array[v_original.product_id::text],
      to_jsonb(coalesce((orig_qty_map->>(v_original.product_id::text))::integer, 0) + v_original.quantity)
    );
  end loop;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_key := v_item->>'productId';
    new_qty_map := jsonb_set(
      new_qty_map, array[v_key],
      to_jsonb(coalesce((new_qty_map->>v_key)::integer, 0) + (v_item->>'quantity')::integer)
    );
    v_total := v_total + (v_item->>'price')::numeric * (v_item->>'quantity')::integer;
  end loop;

  for v_key in
    select jsonb_object_keys(orig_qty_map)
    union
    select jsonb_object_keys(new_qty_map)
  loop
    v_delta := coalesce((new_qty_map->>v_key)::integer, 0) - coalesce((orig_qty_map->>v_key)::integer, 0);
    if v_delta <> 0 then
      v_product_id := v_key::uuid;
      update public.products
      set stock = stock - v_delta
      where id = v_product_id and (v_delta <= 0 or stock >= v_delta);
      get diagnostics v_updated = row_count;
      if v_updated = 0 then
        raise exception 'Estoque insuficiente para concluir a edição';
      end if;
    end if;
  end loop;

  delete from public.order_items where order_id = v_order_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into public.order_items (order_id, product_id, name, category, price, quantity, subtotal)
    values (
      v_order_id,
      (v_item->>'productId')::uuid,
      v_item->>'name',
      v_item->>'category',
      (v_item->>'price')::numeric,
      (v_item->>'quantity')::integer,
      (v_item->>'price')::numeric * (v_item->>'quantity')::integer
    );
  end loop;

  update public.orders set customer_name = p_customer_name, total = v_total where id = v_order_id;

  return true;
end;
$$;

-- EXCLUIR PEDIDO (com ou sem devolver ao estoque)
create or replace function public.delete_order(p_order_code text, p_restock boolean)
returns boolean
language plpgsql
security definer
as $$
declare
  v_order_id uuid;
  v_item record;
begin
  select id into v_order_id from public.orders where code = p_order_code;
  if v_order_id is null then
    return false;
  end if;

  if p_restock then
    for v_item in select product_id, quantity from public.order_items where order_id = v_order_id loop
      update public.products set stock = stock + v_item.quantity where id = v_item.product_id;
    end loop;
  end if;

  delete from public.orders where id = v_order_id;
  return true;
end;
$$;

-- Só quem está logado pode chamar essas funções.
revoke all on function public.create_order(text, uuid, jsonb) from public;
grant execute on function public.create_order(text, uuid, jsonb) to authenticated;

revoke all on function public.update_order(text, text, jsonb) from public;
grant execute on function public.update_order(text, text, jsonb) to authenticated;

revoke all on function public.delete_order(text, boolean) from public;
grant execute on function public.delete_order(text, boolean) to authenticated;
