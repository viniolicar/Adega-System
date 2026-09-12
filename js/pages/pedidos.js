document.addEventListener('DOMContentLoaded', function() {
  const ordersList = document.getElementById('orders-list');
  const orderDetailSection = document.getElementById('order-detail-section');
  const orderListSection = document.getElementById('orders-list-section');

  function renderOrdersList() {
    const orders = OrderManager.getAll();

    if (orders.length === 0) {
      ordersList.innerHTML = '<p class="empty-state">Nenhum pedido realizado ainda.</p>';
      return;
    }

    ordersList.innerHTML = orders.map((order, index) => `
      <div class="order-list-item" data-order-id="${index}">
        <div class="order-card">
          <div class="order-header">
            ${order.id}
            <span class="order-time">${order.time}</span>
          </div>
          <div class="order-body">
            ${order.items.map(item => `${item.quantity}x ${escapeHtml(item.name)}`).join(' — ')}
            <div class="order-list-total">Total: R$ ${formatPrice(order.total)}</div>
          </div>
        </div>
      </div>
    `).join('');

    document.querySelectorAll('.order-list-item').forEach(item => {
      item.addEventListener('click', () => {
        const orderIndex = parseInt(item.dataset.orderId);
        showOrderDetail(orderIndex);
      });
    });
  }

  function showOrderDetail(orderIndex) {
    const orders = OrderManager.getAll();
    const order = orders[orderIndex];

    if (!order) return;

    const detailHtml = `
      <div class="order-detail">
        <h2>${order.id}</h2>
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
  }

  document.addEventListener('click', (e) => {
    if (e.target.textContent.includes('Voltar à lista')) {
      orderDetailSection.style.display = 'none';
      orderListSection.style.display = 'block';
    }
  });

  renderOrdersList();

  window.addEventListener('pageshow', renderOrdersList);
});
