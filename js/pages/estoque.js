function renderStock(products, stockList) {
  if (!products.length) {
    stockList.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--muted)"><p>Nenhum produto cadastrado ainda.</p></div>';
    return;
  }
  stockList.innerHTML = products.map(product => {
    const stock = Math.max(0, Number(product.stock) || 0);
    const statusClass = stock === 0 ? 'zero-stock' : stock <= 10 ? 'low-stock' : '';
    return `<article class="product-card"><div class="product-card-top"><div class="product-icon">📦</div><div class="product-info"><h3>${escapeHtml(product.name)}</h3><p class="product-category">${escapeHtml(product.category)}</p></div></div><div class="product-data"><div class="product-value"><span>Valor</span><strong>R$ ${formatPrice(product.price)}</strong></div><div class="product-stock ${statusClass}"><span>Estoque</span><strong>${stock} unidade${stock !== 1 ? 's' : ''}</strong></div></div><div class="product-actions"><button class="btn-edit" data-id="${product.id}">✏️ Editar</button><button class="btn-delete" data-id="${product.id}">🗑️ Excluir</button></div></article>`;
  }).join('');
  stockList.querySelectorAll('.btn-edit').forEach(button => button.addEventListener('click', () => {
    const product = ProductManager.getById(button.dataset.id);
    if (!product) return;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-modal').classList.add('active');
    document.getElementById('modal-title').textContent = 'Editar Produto';
    stockList.dataset.editingId = product.id;
  }));
  stockList.querySelectorAll('.btn-delete').forEach(button => button.addEventListener('click', () => {
    const product = ProductManager.getById(button.dataset.id);
    if (product && confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      ProductManager.delete(product.id);
      renderStock(ProductManager.getAll(), stockList);
    }
  }));
}

if (document.getElementById('stock-list')) {
  const stockList = document.getElementById('stock-list');
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  const search = document.getElementById('search-input');
  document.getElementById('btn-add-product').addEventListener('click', () => {
    form.reset();
    stockList.dataset.editingId = '';
    document.getElementById('modal-title').textContent = 'Adicionar Produto';
    modal.classList.add('active');
  });
  document.getElementById('btn-cancel').addEventListener('click', () => modal.classList.remove('active'));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = { name: document.getElementById('product-name').value.trim(), category: document.getElementById('product-category').value, price: parseFloat(document.getElementById('product-price').value), stock: Math.max(0, parseInt(document.getElementById('product-stock').value, 10)) };
    const editingId = Number(stockList.dataset.editingId);
    if (stockList.dataset.editingId) ProductManager.update(editingId, data); else ProductManager.add(data);
    modal.classList.remove('active');
    renderStock(ProductManager.getAll(), stockList);
  });
  search.addEventListener('input', event => {
    const term = event.target.value.toLowerCase().trim();
    renderStock(ProductManager.getAll().filter(product => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)), stockList);
  });
  renderStock(ProductManager.getAll(), stockList);
}
