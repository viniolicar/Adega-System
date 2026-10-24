function renderStock(products, stockList, isAdmin) {
  if (!products.length) {
    stockList.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--muted)"><p>Nenhum produto cadastrado ainda.</p></div>';
    return;
  }
  stockList.innerHTML = products.map(product => {
    const stock = Math.max(0, Number(product.stock) || 0);
    const statusClass = stock === 0 ? 'zero-stock' : stock <= 10 ? 'low-stock' : '';
    const actions = isAdmin
      ? `<div class="product-actions"><button class="btn-edit" data-id="${product.id}">✏️ Editar</button><button class="btn-delete" data-id="${product.id}">🗑️ Excluir</button></div>`
      : '';
    return `<article class="product-card"><div class="product-card-top"><div class="product-icon">📦</div><div class="product-info"><h3>${escapeHtml(product.name)}</h3><p class="product-category">${escapeHtml(product.category)}</p></div></div><div class="product-data"><div class="product-value"><span>Valor</span><strong>R$ ${formatPrice(product.price)}</strong></div><div class="product-stock ${statusClass}"><span>Estoque</span><strong>${stock} unidade${stock !== 1 ? 's' : ''}</strong></div></div>${actions}</article>`;
  }).join('');

  if (!isAdmin) return;

  stockList.querySelectorAll('.btn-edit').forEach(button => button.addEventListener('click', async () => {
    const product = await ProductManager.getById(button.dataset.id);
    if (!product) return;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-modal').classList.add('active');
    document.getElementById('modal-title').textContent = 'Editar Produto';
    stockList.dataset.editingId = product.id;
  }));
  stockList.querySelectorAll('.btn-delete').forEach(button => button.addEventListener('click', async () => {
    const product = await ProductManager.getById(button.dataset.id);
    if (product && confirm(`Tem certeza que deseja excluir "${product.name}"?`)) {
      await ProductManager.delete(product.id);
      renderStock(await ProductManager.getAll(), stockList, isAdmin);
    }
  }));
}

if (document.getElementById('stock-list')) {
  const stockList = document.getElementById('stock-list');
  const modal = document.getElementById('product-modal');
  const form = document.getElementById('product-form');
  const search = document.getElementById('search-input');
  const addButton = document.getElementById('btn-add-product');

  document.addEventListener('DOMContentLoaded', async () => {
    const profile = await getCurrentProfile();
    const isAdmin = !!profile && profile.role === 'administrador';

    // Só administrador pode cadastrar/editar/excluir produtos — o banco
    // já bloqueia isso por segurança (RLS), mas escondemos os botões
    // aqui também, para não confundir quem não tem permissão.
    addButton.style.display = isAdmin ? '' : 'none';

    addButton.addEventListener('click', () => {
      form.reset();
      stockList.dataset.editingId = '';
      document.getElementById('modal-title').textContent = 'Adicionar Produto';
      modal.classList.add('active');
    });

    document.getElementById('btn-cancel').addEventListener('click', () => modal.classList.remove('active'));

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = {
        name: document.getElementById('product-name').value.trim(),
        category: document.getElementById('product-category').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: Math.max(0, parseInt(document.getElementById('product-stock').value, 10))
      };
      try {
        if (stockList.dataset.editingId) {
          await ProductManager.update(stockList.dataset.editingId, data);
        } else {
          await ProductManager.add(data);
        }
        modal.classList.remove('active');
        renderStock(await ProductManager.getAll(), stockList, isAdmin);
      } catch (error) {
        alert('Não foi possível salvar o produto. Verifique sua conexão e tente novamente.');
      }
    });

    search.addEventListener('input', async event => {
      const term = event.target.value.toLowerCase().trim();
      const products = await ProductManager.getAll();
      renderStock(products.filter(product => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)), stockList, isAdmin);
    });

    renderStock(await ProductManager.getAll(), stockList, isAdmin);
  });
}
