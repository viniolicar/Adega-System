function renderDailySummary() {
  const ordersCountEl = document.getElementById('summary-orders-count');
  if (!ordersCountEl) return;
  const today = new Date().toLocaleDateString('pt-BR');
  const todayOrders = OrderManager.getAll().filter(order => order.date === today);
  const lowStockCount = ProductManager.getAll().filter(product => (Number(product.stock) || 0) <= 10).length;
  ordersCountEl.textContent = todayOrders.length;
  document.getElementById('summary-total').textContent = `R$ ${formatPrice(todayOrders.reduce((sum, order) => sum + order.total, 0))}`;
  document.getElementById('summary-low-stock').textContent = lowStockCount;
}
renderDailySummary();
window.addEventListener('pageshow', renderDailySummary);

if (document.getElementById('order-modal')) {
  let items = [];
  const modal = document.getElementById('order-modal');
  const customerName = document.getElementById('order-customer-name');
  const select = document.getElementById('order-product-select');
  const quantity = document.getElementById('order-product-qty');
  const list = document.getElementById('order-items-list');
  const totalArea = document.getElementById('order-total-area');
  const total = document.getElementById('order-total');
  const finish = document.getElementById('btn-finalize-order');
  const render = () => {
    if (!items.length) {
      list.innerHTML = '<p style="text-align:center;color:var(--muted);font-size:13px">Nenhum item adicionado ainda</p>';
      totalArea.style.display = 'none';
      finish.style.display = 'none';
      return;
    }
    list.innerHTML = items.map((item, index) => `<div class="order-item"><div class="order-item-info"><div class="order-item-name">${escapeHtml(item.name)}</div><div class="order-item-price">R$ ${formatPrice(item.price)} x ${item.quantity}</div></div><strong>R$ ${formatPrice(item.price * item.quantity)}</strong><button class="order-item-remove" data-index="${index}" type="button">🗑️</button></div>`).join('');
    list.querySelectorAll('.order-item-remove').forEach(button => button.addEventListener('click', () => { items.splice(Number(button.dataset.index), 1); render(); }));
    total.textContent = `R$ ${formatPrice(items.reduce((sum, item) => sum + item.price * item.quantity, 0))}`;
    totalArea.style.display = 'block';
    finish.style.display = 'block';
  };
  const populate = () => { select.innerHTML = '<option value="">Escolha um produto...</option>' + ProductManager.getAll().map(product => { const stock = Math.max(0, Number(product.stock) || 0); return `<option value="${product.id}" data-stock="${stock}" ${stock === 0 ? 'disabled' : ''}>${escapeHtml(product.name)} - R$ ${formatPrice(product.price)} ${stock === 0 ? '(Esgotado)' : `(${stock} em estoque)`}</option>`; }).join(''); };
  document.getElementById('new-order').addEventListener('click', () => { items = []; customerName.value = ''; quantity.value = '1'; populate(); render(); modal.classList.add('active'); });
  document.getElementById('btn-cancel-order').addEventListener('click', () => modal.classList.remove('active'));
  document.getElementById('btn-add-to-order').addEventListener('click', () => {
    const product = ProductManager.getById(Number(select.value));
    const amount = parseInt(quantity.value, 10);
    if (!product) return alert('Selecione um produto.');
    const existing = items.find(item => item.productId === product.id);
    if (!Number.isInteger(amount) || amount < 1) return alert('Informe uma quantidade válida.');
    if ((existing ? existing.quantity : 0) + amount > product.stock) return alert(`Estoque insuficiente. Disponível: ${product.stock}.`);
    if (existing) existing.quantity += amount; else items.push({ productId: product.id, name: product.name, category: product.category, price: product.price, quantity: amount });
    select.value = '';
    quantity.value = '1';
    render();
  });
  finish.addEventListener('click', () => {
    const name = customerName.value.trim();
    if (!name) return alert('Informe o nome do cliente.');
    const products = ProductManager.getAll();
    if (!items.length) return alert('Adicione pelo menos um item ao pedido.');
    if (items.some(item => { const product = products.find(candidate => candidate.id === item.productId); return !product || item.quantity > product.stock; })) return alert('O estoque mudou. Revise os itens do pedido.');
    items.forEach(item => { const product = ProductManager.getById(item.productId); ProductManager.update(item.productId, { stock: Math.max(0, product.stock - item.quantity) }); });
    OrderManager.add({ customerName: name, items: items.map(item => ({ ...item, subtotal: item.price * item.quantity })), total: items.reduce((sum, item) => sum + item.price * item.quantity, 0) });
    items = [];
    modal.classList.remove('active');
    renderDailySummary();
    alert('Pedido finalizado com sucesso!');
  });
}
