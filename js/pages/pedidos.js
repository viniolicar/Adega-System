document.addEventListener('DOMContentLoaded', async function() {
  const ordersList = document.getElementById('orders-list');
  const orderDetailSection = document.getElementById('order-detail-section');
  const orderListSection = document.getElementById('orders-list-section');

  let currentDetailOrderId = null;

  async function renderOrdersList() {
    const orders = await OrderManager.getAll();

    if (orders.length === 0) {
      ordersList.innerHTML = '<p class="empty-state">Nenhum pedido realizado ainda.</p>';
      return;
    }

    ordersList.innerHTML = orders.map(order => `
      <div class="order-list-item" data-order-id="${order.id}">
        <div class="order-card">
          <div class="order-header">
            ${order.id}
            <span class="order-time">${order.time}</span>
          </div>
          <div class="order-customer">Cliente: ${escapeHtml(order.customerName || '-')}</div>
          <div class="order-body">
            ${order.items.map(item => `${item.quantity}x ${escapeHtml(item.name)}`).join(' — ')}
            <div class="order-list-total">Total: R$ ${formatPrice(order.total)}</div>
          </div>
          <div class="product-actions">
            <button type="button" class="btn-edit" data-action="edit" data-id="${order.id}">✏️ Editar</button>
            <button type="button" class="btn-delete" data-action="delete" data-id="${order.id}">🗑️ Excluir</button>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.order-list-item').forEach(item => {
      item.addEventListener('click', () => {
        showOrderDetail(item.dataset.orderId);
      });
    });

    ordersList.querySelectorAll('[data-action="edit"]').forEach(button => button.addEventListener('click', (event) => {
      event.stopPropagation();
      openEditModal(button.dataset.id);
    }));

    ordersList.querySelectorAll('[data-action="delete"]').forEach(button => button.addEventListener('click', (event) => {
      event.stopPropagation();
      openDeleteModal(button.dataset.id);
    }));
  }

  async function showOrderDetail(orderId) {
    const order = await OrderManager.getById(orderId);

    if (!order) return;

    currentDetailOrderId = orderId;

    const detailHtml = `
      <div class="order-detail">
        <h2>${order.id}</h2>
        <p class="order-detail-meta"><strong>Cliente:</strong> ${escapeHtml(order.customerName || '-')}</p>
        <p class="order-detail-meta"><strong>Data:</strong> ${order.date} às ${order.time}</p>

        <table class="order-detail-table">
          <thead>
            <tr>
              <th>Produto</th>
              <th class="col-center">Qtd</th>
              <th class="col-right">Preço Unit.</th>
              <th class="col-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td>${escapeHtml(item.name)}</td>
                <td class="col-center">${item.quantity}</td>
                <td class="col-right">R$ ${formatPrice(item.price)}</td>
                <td class="col-right col-strong">R$ ${formatPrice(item.subtotal)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="order-detail-total">
          <span class="order-detail-total-label">TOTAL:</span>
          <span class="order-detail-total-value">R$ ${formatPrice(order.total)}</span>
        </div>

        <div class="order-detail-actions">
          <button type="button" id="btn-edit-order" class="btn-cancel">✏️ Editar</button>
          <button type="button" id="btn-delete-order" class="btn-cancel" style="color: var(--danger);">🗑️ Excluir</button>
        </div>

        <button type="button" id="print-button" class="btn primary print-button">
          🖨 Imprimir Pedido
        </button>
      </div>
    `;

    orderDetailSection.style.display = 'block';
    orderListSection.style.display = 'none';
    document.getElementById('order-detail-content').innerHTML = detailHtml;

    document.getElementById('print-button').addEventListener('click', () => {
      window.print();
    });
    document.getElementById('btn-edit-order').addEventListener('click', () => openEditModal(orderId));
    document.getElementById('btn-delete-order').addEventListener('click', () => openDeleteModal(orderId));
  }

  document.addEventListener('click', (e) => {
    if (e.target.textContent.includes('Voltar à lista')) {
      orderDetailSection.style.display = 'none';
      orderListSection.style.display = 'block';
    }
  });

  // ---------- EDIÇÃO DE PEDIDO ----------

  const editModal = document.getElementById('edit-order-modal');
  const editCustomerName = document.getElementById('edit-customer-name');
  const editSelect = document.getElementById('edit-product-select');
  const editQty = document.getElementById('edit-product-qty');
  const editItemsList = document.getElementById('edit-items-list');
  const editTotal = document.getElementById('edit-total');
  const btnSaveEdit = document.getElementById('btn-save-edit');

  let editItems = [];
  let editOriginalQtyMap = {};
  let editingOrderId = null;

  // Estoque "disponível" pra fins de edição: o estoque atual do produto
  // + o que este mesmo pedido já tinha reservado antes de começar a edição
  // (senão o campo mostraria um número menor do que realmente é possível usar).
  function trueAvailable(product) {
    const key = String(product.id);
    return (Number(product.stock) || 0) + (editOriginalQtyMap[key] || 0);
  }

  async function populateEditSelect() {
    const products = await ProductManager.getAll();
    editSelect.innerHTML = '<option value="">Escolha um produto...</option>' + products.map(product => {
      const avail = Math.max(0, trueAvailable(product));
      return `<option value="${product.id}" ${avail === 0 ? 'disabled' : ''}>${escapeHtml(product.name)} - R$ ${formatPrice(product.price)} ${avail === 0 ? '(Esgotado)' : `(${avail} disponível)`}</option>`;
    }).join('');
  }

  function renderEditItems() {
    if (!editItems.length) {
      editItemsList.innerHTML = '<p style="text-align:center;color:var(--muted);font-size:13px">Nenhum item no pedido</p>';
      editTotal.textContent = 'R$ 0,00';
      return;
    }
    editItemsList.innerHTML = editItems.map((item, index) => `<div class="order-item"><div class="order-item-info"><div class="order-item-name">${escapeHtml(item.name)}</div><div class="order-item-price">R$ ${formatPrice(item.price)} x ${item.quantity}</div></div><strong>R$ ${formatPrice(item.price * item.quantity)}</strong><button class="order-item-remove" data-index="${index}" type="button">🗑️</button></div>`).join('');
    editItemsList.querySelectorAll('.order-item-remove').forEach(button => button.addEventListener('click', () => { editItems.splice(Number(button.dataset.index), 1); renderEditItems(); }));
    editTotal.textContent = `R$ ${formatPrice(editItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}`;
  }

  async function openEditModal(orderId) {
    const order = await OrderManager.getById(orderId);
    if (!order) return;

    editingOrderId = orderId;
    editItems = order.items.map(item => ({ ...item }));
    editOriginalQtyMap = {};
    order.items.forEach(item => {
      const key = String(item.productId);
      editOriginalQtyMap[key] = (editOriginalQtyMap[key] || 0) + item.quantity;
    });

    editCustomerName.value = order.customerName || '';
    editQty.value = '1';
    await populateEditSelect();
    renderEditItems();
    editModal.classList.add('active');
  }

  document.getElementById('btn-cancel-edit').addEventListener('click', () => {
    editModal.classList.remove('active');
    editingOrderId = null;
  });

  document.getElementById('btn-add-to-edit').addEventListener('click', async () => {
    const product = await ProductManager.getById(editSelect.value);
    const amount = parseInt(editQty.value, 10);
    if (!product) return alert('Selecione um produto.');
    if (!Number.isInteger(amount) || amount < 1) return alert('Informe uma quantidade válida.');
    const existing = editItems.find(item => item.productId === product.id);
    const currentQty = existing ? existing.quantity : 0;
    const avail = trueAvailable(product);
    if (currentQty + amount > avail) return alert(`Estoque insuficiente. Disponível: ${avail}.`);
    if (existing) existing.quantity += amount; else editItems.push({ productId: product.id, name: product.name, category: product.category, price: product.price, quantity: amount });
    editSelect.value = '';
    editQty.value = '1';
    renderEditItems();
  });

  btnSaveEdit.addEventListener('click', async () => {
    const name = editCustomerName.value.trim();
    if (!name) return alert('Informe o nome do cliente.');
    if (!editItems.length) return alert('O pedido precisa ter pelo menos um item.');

    btnSaveEdit.disabled = true;
    btnSaveEdit.textContent = 'SALVANDO...';
    try {
      await OrderManager.updateItems(editingOrderId, name, editItems.map(item => ({
        productId: item.productId,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity: item.quantity
      })));

      editModal.classList.remove('active');
      await renderOrdersList();
      if (orderDetailSection.style.display === 'block' && currentDetailOrderId === editingOrderId) {
        await showOrderDetail(editingOrderId);
      }
      editingOrderId = null;
      alert('Pedido atualizado com sucesso!');
    } catch (error) {
      alert(error.message || 'Não foi possível salvar as alterações. Verifique sua conexão e tente novamente.');
    } finally {
      btnSaveEdit.disabled = false;
      btnSaveEdit.textContent = 'SALVAR ALTERAÇÕES';
    }
  });

  // ---------- EXCLUSÃO DE PEDIDO ----------

  const deleteModal = document.getElementById('delete-order-modal');
  const deleteTitle = document.getElementById('delete-order-title');
  let orderPendingDelete = null;

  function openDeleteModal(orderId) {
    orderPendingDelete = orderId;
    deleteTitle.textContent = `Excluir pedido ${orderId}?`;
    deleteModal.classList.add('active');
  }

  async function finishDelete(restock) {
    if (!orderPendingDelete) return;
    try {
      await OrderManager.remove(orderPendingDelete, restock);
      deleteModal.classList.remove('active');
      orderPendingDelete = null;
      await renderOrdersList();
      orderDetailSection.style.display = 'none';
      orderListSection.style.display = 'block';
    } catch (error) {
      alert('Não foi possível excluir o pedido. Verifique sua conexão e tente novamente.');
    }
  }

  document.getElementById('btn-cancel-delete').addEventListener('click', () => {
    deleteModal.classList.remove('active');
    orderPendingDelete = null;
  });

  document.getElementById('btn-delete-restock').addEventListener('click', () => finishDelete(true));
  document.getElementById('btn-delete-keep').addEventListener('click', () => finishDelete(false));

  await renderOrdersList();

  window.addEventListener('pageshow', renderOrdersList);
});
