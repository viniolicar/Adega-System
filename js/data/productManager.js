const ProductManager = {
  storageKey: 'adega_products',
  getAll() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  },
  saveAll(products) {
    localStorage.setItem(this.storageKey, JSON.stringify(products));
  },
  add(product) {
    product.id = Date.now() + Math.random();
    const products = this.getAll();
    products.push(product);
    this.saveAll(products);
    return product;
  },
  update(id, data) {
    this.saveAll(this.getAll().map(product => String(product.id) === String(id) ? { ...product, ...data } : product));
  },
  delete(id) {
    this.saveAll(this.getAll().filter(product => String(product.id) !== String(id)));
  },
  getById(id) {
    return this.getAll().find(product => String(product.id) === String(id));
  }
};

const catalog = [
  ['Copão','Gin (Tropical / Melancia / Morango)',15],['Copão','Whisky Gold Star',12],["Copão","Jack Daniel's Clássico",35],['Copão','Red Label',30],['Copão','Cavalo Branco',25],['Copão','Ballantines',30],['Copão','Passport',20],['Copão','Beefeater',25],['Copão','Ballantines Abacaxi',23],['Copão','Jack Mace',35],['Copão','Chancellor',15],['Copão','Gin Tanqueray',30],['Copão','Busca Brisa',15],
  ['Batidas','Frozen',20],['Batidas','Amarula',20],['Batidas','Brasília Amarela',20],['Batidas','Chevete',20],['Batidas','Capeta',20],['Batidas','Espanhola',20],['Batidas','Batida da Casa',20],['Batidas','Açaí c/ Maracujá',30],['Batidas','Açaí c/ Morango',30],
  ['Baldes','Caipirinha',50],['Baldes','Passport',50],['Baldes','Whisky Gold Star',40],['Baldes','Frozen',50],['Baldes','Gin',40],['Baldes','Balde da Casa',40],['Baldes','Cavalo Branco',60],['Baldes','Red Label',60],['Baldes','Beefeater',60],
  ['Cervejas','Brahma',5],['Cervejas','Antarctica',5],['Cervejas','Heineken',10],['Cervejas','Budweiser',10],
  ['Bebidas Variadas','Água',4],['Bebidas Variadas','Água c/ Gás',4],['Bebidas Variadas','Água Tônica',6],['Bebidas Variadas','Coca 350ml (Normal ou Zero)',6],['Bebidas Variadas','Coca 600ml',8],['Bebidas Variadas','Guaraná Antarctica 1L',8],['Bebidas Variadas','H2O 500ml',7],['Bebidas Variadas','Energético Bally 473ml',13],['Bebidas Variadas','Energético Monster 473ml',15],['Bebidas Variadas','Energético Red Bull 250ml',15],
  ['Drinks Variados','Skol Beats',10],['Drinks Variados','Ice',10],['Drinks Variados','Ice Smirnoff',12],['Drinks Variados','Stempel',15],['Drinks Variados','Morango c/ Askov',25],['Drinks Variados','Corote Combo',20],
  ['Caipirinha','Morango',20],['Caipirinha','Limão',20],['Caipirinha','Maracujá',20],['Caipirinha','Morango c/ limão',20],['Caipirinha','Morango c/ abacaxi',20],['Caipirinha','Ballena',35],
  ['Batata','Batata frita grande',25],['Batata','Batata pequena',13],
  ['Lanches','Meia-Noite BBQ',41],['Lanches','Salada Luar',33],['Lanches','Bacon Galáctico',35],['Lanches','Smash Nebuloso',31],['Lanches','Hot Dog Espacial',25],
  ['Outros','Isqueiro',5],['Outros','Cigarro',15],['Outros','Salgadinho',4],
  ['Pastel','Pastel (Carne)',10],['Pastel','Pastel (Queijo)',10],['Pastel','Pastel (Carne com Queijo)',10],['Pastel','Pastel (Carne com Cheddar)',10],['Pastel','Pastel (Presunto e Queijo)',10],['Pastel','Pastel (Pizza)',10]
];

function initializeCatalog() {
  const legacyNames = new Set(['Heineken 600ml', 'Brahma 600ml', 'Coca-Cola 2L', 'Red Bull 250ml']);
  const originalProducts = ProductManager.getAll();
  const products = originalProducts.filter(product => !legacyNames.has(product.name));
  let changed = products.length !== originalProducts.length;
  catalog.forEach(([category, name, price]) => {
    const product = products.find(item => item.name === name && item.category === category);
    if (!product) {
      products.push({ id: Date.now() + Math.random(), name, category, price, stock: 15 });
      changed = true;
    } else {
      if (product.price !== price) {
        product.price = price;
        changed = true;
      }
      if (product.stock === undefined || product.stock === null) {
        product.stock = 15;
        changed = true;
      }
    }
  });
  if (changed || !localStorage.getItem(ProductManager.storageKey)) ProductManager.saveAll(products);
}
initializeCatalog();

// Correção única: nivela o estoque de TODOS os produtos para 15, mesmo os que já tinham
// um valor definido. Roda só uma vez (marcada pela flag abaixo) para não apagar vendas
// e ajustes feitos depois dessa correção.
function resetAllStockToFifteenOnce() {
  const flagKey = 'adega_stock_reset_15_v1';
  if (localStorage.getItem(flagKey)) return;
  const products = ProductManager.getAll();
  products.forEach(product => { product.stock = 15; });
  ProductManager.saveAll(products);
  localStorage.setItem(flagKey, '1');
}
resetAllStockToFifteenOnce();
