# Banco de dados (Supabase)

Estes scripts SQL montam o banco do Adega System do zero. Eles guardam a **estrutura** (tabelas, regras de segurança e funções) e o cardápio inicial. **Não são backup dos dados** (pedidos e estoque de verdade): para isso, exporte as tabelas em CSV pelo painel do Supabase.

## Como recriar o banco

1. Crie um projeto novo em [supabase.com](https://supabase.com).
2. No painel, abra **SQL Editor** e rode os arquivos **nesta ordem**, cada um numa *New query*:

   | Ordem | Arquivo | O que faz |
   |---|---|---|
   | 1 | `1_estrutura.sql` | Cria as tabelas, as regras de segurança (RLS) e o gatilho que cria o perfil de cada novo usuário |
   | 2 | `2_catalogo.sql` | Cria o contador dos códigos de pedido (PED0001...) e cadastra os 73 produtos com estoque 15 |
   | 3 | `3_operacoes_de_pedido.sql` | Cria as funções de criar, editar e excluir pedido, que mexem no estoque com segurança |

3. Crie o usuário administrador em **Authentication → Users → Add user** (email e senha).
4. Torne esse usuário administrador, rodando no SQL Editor (troque o email e o nome):

   ```sql
   update public.profiles
   set nome = 'Nome do Administrador', role = 'administrador'
   where id = (select id from auth.users where email = 'email@exemplo.com');
   ```

5. Em **Project Settings → API**, copie a **Project URL** e a chave **publishable** e coloque em `js/supabaseClient.js`.

## Cuidados

- Rode cada arquivo **uma vez só**. O `2_catalogo.sql` duplicaria os produtos se fosse rodado de novo, e o `1_estrutura.sql` dá o erro inofensivo "policy already exists".
- Nunca coloque no código a chave secreta (`service_role`) nem a senha de ninguém. A chave publishable é pública por natureza; a segurança vem do login e do RLS.
