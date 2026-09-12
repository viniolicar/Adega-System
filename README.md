# Adega System

Sistema interno de pedidos, estoque e controle de vendas da **Adega PC**, pensado para uso diário por funcionários pelo celular.

## Funcionalidades

- Criação de pedidos com seleção de produtos por categoria
- Controle de estoque (cadastro, edição, exclusão e busca de produtos)
- Central de Pedidos: histórico, detalhe e impressão de pedidos
- Atualização automática do estoque ao finalizar um pedido

## Categorias do cardápio

Copão, Batidas, Baldes, Cervejas, Bebidas Variadas, Drinks Variados, Caipirinha, Batata, Lanches e Outros.

## Tecnologia

Front-end estático (HTML, CSS e JavaScript puro, sem frameworks), com dados salvos localmente no navegador (`localStorage`).

> Essa é uma limitação conhecida: por enquanto os dados não são compartilhados entre celulares diferentes. A evolução para um banco de dados compartilhado (multiusuário) está no roteiro do projeto.

## Estrutura do projeto

```
adega-system/
├── index.html              # Página inicial / criação de pedido
├── html/
│   ├── estoque.html         # Gestão de produtos e estoque
│   └── pedidos.html         # Central de Pedidos
├── css/
│   └── style.css
├── js/
│   ├── utils.js              # Funções auxiliares (formatação, escape de texto)
│   ├── data/
│   │   ├── productManager.js # Regras de produtos e catálogo
│   │   └── orderManager.js   # Regras de pedidos
│   └── pages/
│       ├── index.js          # Lógica da tela inicial
│       ├── estoque.js        # Lógica da tela de estoque
│       └── pedidos.js        # Lógica da Central de Pedidos
├── img/
└── assets/
```

## Como rodar localmente

O projeto não precisa de instalação. Basta servir os arquivos com qualquer servidor estático, por exemplo:

```bash
npx http-server -p 8080
```

E acessar `http://localhost:8080`.

> Abrir os arquivos diretamente com duplo clique (`file://`) pode não carregar os módulos JavaScript corretamente em alguns navegadores — prefira sempre um servidor local.
