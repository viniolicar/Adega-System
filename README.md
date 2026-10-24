# Adega System

Sistema interno de pedidos, estoque e controle de vendas da **Adega PC**, feito para uso diário pelo celular. Funciona como app instalável (PWA), com login de funcionário e dados compartilhados em um banco de dados na nuvem.

**Online:** https://viniolicar.github.io/Adega-System/

## Funcionalidades

- **Login de funcionário** (email e senha), com tela protegida: sem login, nenhuma página abre
- **Criação de pedidos** com nome do cliente e produtos por categoria
- **Edição e exclusão de pedidos**, com a opção de devolver ou não os produtos ao estoque
- **Central de Pedidos:** histórico, detalhe e impressão
- **Controle de estoque:** cadastro, edição, exclusão e busca de produtos (somente administrador)
- **Resumo do dia** na tela inicial: pedidos, total vendido e produtos com estoque baixo
- **Tela Mais:** perfil de quem está logado, botão Sair, produtos com estoque baixo e troca entre modo claro e escuro
- **App instalável** no celular, com ícone próprio e tela cheia

## Categorias do cardápio

Copão, Batidas, Baldes, Cervejas, Bebidas Variadas, Drinks Variados, Caipirinha, Batata, Lanches, Pastel e Outros.

## Tecnologia

- **Front-end:** HTML, CSS e JavaScript puro, sem frameworks, pensado primeiro para celular
- **Banco de dados e login:** [Supabase](https://supabase.com) (PostgreSQL + autenticação), acessado pelo `supabase-js` carregado por CDN
- **App instalável:** `manifest.webmanifest` + service worker (`sw.js`)
- **Hospedagem:** GitHub Pages

### Como os dados são protegidos

- **Row Level Security (RLS):** o banco só entrega dados a quem está logado. Alterar produtos é permitido apenas ao perfil de administrador, e essa regra vale no banco, não só nos botões da tela.
- **Operações de pedido atômicas:** criar, editar e excluir pedido são funções do banco (`create_order`, `update_order`, `delete_order`) que mexem no pedido e no estoque numa única transação. Se dois funcionários venderem o último item ao mesmo tempo, o segundo recebe "Estoque insuficiente" e o estoque nunca fica negativo.
- **Chave pública:** a chave que está em `js/supabaseClient.js` (`sb_publishable_...`) é a chave pública do Supabase, feita para ficar no navegador. A segurança vem do login e do RLS. Senhas e a chave secreta (`service_role`) **nunca** entram no código.

### Tabelas do banco

| Tabela | Conteúdo |
|---|---|
| `profiles` | Funcionários: nome e papel (`funcionario` ou `administrador`), criada automaticamente a cada novo usuário |
| `products` | Produtos: nome, categoria, preço e estoque |
| `orders` | Pedidos: código (PED0001...), cliente, funcionário, total e data |
| `order_items` | Itens de cada pedido, com nome e preço guardados no momento da venda |

> Os scripts SQL que criam as tabelas, as regras de segurança, o cardápio e as funções estão na pasta [`database/`](database/), com o passo a passo para recriar o banco do zero.

## Estrutura do projeto

```
adega-system/
├── index.html              # Início: criar pedido e resumo do dia
├── login.html              # Tela de login
├── manifest.webmanifest    # Configuração do app instalável
├── sw.js                   # Service worker (cópia dos arquivos para abrir rápido)
├── html/
│   ├── estoque.html         # Gestão de produtos e estoque
│   ├── pedidos.html         # Central de Pedidos
│   └── mais.html            # Perfil, tema e estoque baixo
├── css/
│   └── style.css
├── database/               # Scripts SQL do banco (Supabase) e passo a passo
├── js/
│   ├── supabaseClient.js     # Conexão com o Supabase
│   ├── authGuard.js          # Bloqueia páginas para quem não está logado
│   ├── auth.js               # Perfil do usuário logado e logout
│   ├── theme.js              # Modo claro e escuro
│   ├── pwa.js                # Registro do service worker
│   ├── utils.js              # Funções auxiliares (formatação, escape de texto)
│   ├── data/
│   │   ├── productManager.js # Acesso a produtos no banco
│   │   └── orderManager.js   # Acesso a pedidos no banco
│   └── pages/
│       ├── index.js
│       ├── login.js
│       ├── estoque.js
│       ├── pedidos.js
│       └── mais.js
├── img/
│   ├── adega_logo.jpg
│   └── icons/                # Ícones do app
└── assets/
```

## Como rodar localmente

O projeto não precisa de instalação. Basta servir os arquivos com qualquer servidor estático:

```bash
npx http-server -p 8080
```

E acessar `http://localhost:8080`. É preciso ter internet, porque o login e os dados vêm do Supabase.

> Abrir os arquivos com duplo clique (`file://`) não funciona, porque o login e o service worker exigem um endereço `http://`. Use sempre um servidor local.

## Publicação

O site é publicado pelo GitHub Pages a partir da branch `master`: cada `git push` atualiza o app para todos em poucos minutos. Para pegar a versão nova, às vezes é preciso fechar e abrir o app uma vez.

## Cuidados de operação

- **Criar funcionários:** no painel do Supabase, em *Authentication → Users → Add user*. Por padrão o novo usuário entra como `funcionario`; para torná-lo administrador, altere o campo `role` na tabela `profiles`.
- **Projeto gratuito pausa:** o plano gratuito do Supabase pausa o projeto após cerca de 1 semana sem uso. Se isso acontecer, basta restaurá-lo no painel.
- **Backup:** o plano gratuito não faz backup automático. Exporte as tabelas em CSV (*Table Editor*) de tempos em tempos.
