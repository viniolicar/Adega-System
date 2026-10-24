-- ====================================================
-- ADEGA SYSTEM — passo 2: código do pedido (PED0001...) e catálogo de produtos
-- ====================================================
-- Antes, o código do pedido era contado no celular (quantos pedidos já
-- existem + 1). Isso pode falhar com dois celulares criando pedido ao
-- mesmo tempo. Agora, o próprio banco gera o número, de forma segura.

create sequence if not exists public.order_code_seq;

create or replace function public.set_order_code()
returns trigger
language plpgsql
as $$
begin
  if new.code is null then
    new.code := 'PED' || lpad(nextval('public.order_code_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists set_order_code_trigger on public.orders;
create trigger set_order_code_trigger
  before insert on public.orders
  for each row execute procedure public.set_order_code();

-- ATENÇÃO: rode este arquivo UMA vez só. O INSERT abaixo não verifica se os
-- produtos já existem, então rodar de novo duplicaria o cardápio.

-- ====================================================
-- Popular o catálogo de produtos no banco
-- (os mesmos 73 produtos que já existiam no localStorage,
-- todos com estoque inicial de 15 unidades)
-- ====================================================

insert into public.products (name, category, price, stock) values
  ('Gin (Tropical / Melancia / Morango)', 'Copão', 15, 15),
  ('Whisky Gold Star', 'Copão', 12, 15),
  ('Jack Daniel''s Clássico', 'Copão', 35, 15),
  ('Red Label', 'Copão', 30, 15),
  ('Cavalo Branco', 'Copão', 25, 15),
  ('Ballantines', 'Copão', 30, 15),
  ('Passport', 'Copão', 20, 15),
  ('Beefeater', 'Copão', 25, 15),
  ('Ballantines Abacaxi', 'Copão', 23, 15),
  ('Jack Mace', 'Copão', 35, 15),
  ('Chancellor', 'Copão', 15, 15),
  ('Gin Tanqueray', 'Copão', 30, 15),
  ('Busca Brisa', 'Copão', 15, 15),
  ('Frozen', 'Batidas', 20, 15),
  ('Amarula', 'Batidas', 20, 15),
  ('Brasília Amarela', 'Batidas', 20, 15),
  ('Chevete', 'Batidas', 20, 15),
  ('Capeta', 'Batidas', 20, 15),
  ('Espanhola', 'Batidas', 20, 15),
  ('Batida da Casa', 'Batidas', 20, 15),
  ('Açaí c/ Maracujá', 'Batidas', 30, 15),
  ('Açaí c/ Morango', 'Batidas', 30, 15),
  ('Caipirinha', 'Baldes', 50, 15),
  ('Passport', 'Baldes', 50, 15),
  ('Whisky Gold Star', 'Baldes', 40, 15),
  ('Frozen', 'Baldes', 50, 15),
  ('Gin', 'Baldes', 40, 15),
  ('Balde da Casa', 'Baldes', 40, 15),
  ('Cavalo Branco', 'Baldes', 60, 15),
  ('Red Label', 'Baldes', 60, 15),
  ('Beefeater', 'Baldes', 60, 15),
  ('Brahma', 'Cervejas', 5, 15),
  ('Antarctica', 'Cervejas', 5, 15),
  ('Heineken', 'Cervejas', 10, 15),
  ('Budweiser', 'Cervejas', 10, 15),
  ('Água', 'Bebidas Variadas', 4, 15),
  ('Água c/ Gás', 'Bebidas Variadas', 4, 15),
  ('Água Tônica', 'Bebidas Variadas', 6, 15),
  ('Coca 350ml (Normal ou Zero)', 'Bebidas Variadas', 6, 15),
  ('Coca 600ml', 'Bebidas Variadas', 8, 15),
  ('Guaraná Antarctica 1L', 'Bebidas Variadas', 8, 15),
  ('H2O 500ml', 'Bebidas Variadas', 7, 15),
  ('Energético Bally 473ml', 'Bebidas Variadas', 13, 15),
  ('Energético Monster 473ml', 'Bebidas Variadas', 15, 15),
  ('Energético Red Bull 250ml', 'Bebidas Variadas', 15, 15),
  ('Skol Beats', 'Drinks Variados', 10, 15),
  ('Ice', 'Drinks Variados', 10, 15),
  ('Ice Smirnoff', 'Drinks Variados', 12, 15),
  ('Stempel', 'Drinks Variados', 15, 15),
  ('Morango c/ Askov', 'Drinks Variados', 25, 15),
  ('Corote Combo', 'Drinks Variados', 20, 15),
  ('Morango', 'Caipirinha', 20, 15),
  ('Limão', 'Caipirinha', 20, 15),
  ('Maracujá', 'Caipirinha', 20, 15),
  ('Morango c/ limão', 'Caipirinha', 20, 15),
  ('Morango c/ abacaxi', 'Caipirinha', 20, 15),
  ('Ballena', 'Caipirinha', 35, 15),
  ('Batata frita grande', 'Batata', 25, 15),
  ('Batata pequena', 'Batata', 13, 15),
  ('Meia-Noite BBQ', 'Lanches', 41, 15),
  ('Salada Luar', 'Lanches', 33, 15),
  ('Bacon Galáctico', 'Lanches', 35, 15),
  ('Smash Nebuloso', 'Lanches', 31, 15),
  ('Hot Dog Espacial', 'Lanches', 25, 15),
  ('Isqueiro', 'Outros', 5, 15),
  ('Cigarro', 'Outros', 15, 15),
  ('Salgadinho', 'Outros', 4, 15),
  ('Pastel (Carne)', 'Pastel', 10, 15),
  ('Pastel (Queijo)', 'Pastel', 10, 15),
  ('Pastel (Carne com Queijo)', 'Pastel', 10, 15),
  ('Pastel (Carne com Cheddar)', 'Pastel', 10, 15),
  ('Pastel (Presunto e Queijo)', 'Pastel', 10, 15),
  ('Pastel (Pizza)', 'Pastel', 10, 15);
