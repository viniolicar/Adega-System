document.addEventListener('DOMContentLoaded', function() {
  const lowStockList = document.getElementById('low-stock-list');

  function renderLowStock() {
    const products = ProductManager.getAll().filter(product => (Number(product.stock) || 0) <= 10);

    if (!products.length) {
      lowStockList.innerHTML = '<p class="empty-state">✓ Nenhum produto com estoque baixo</p>';
      return;
    }

    lowStockList.innerHTML = products
      .sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0))
      .map(product => {
        const stock = Math.max(0, Number(product.stock) || 0);
        const dotClass = stock === 0 ? 'low-stock-dot-critical' : 'low-stock-dot-warning';
        return `<div class="low-stock-row"><span class="low-stock-dot ${dotClass}"></span><div><div class="low-stock-name">${escapeHtml(product.name)}</div><div class="low-stock-qty">${stock} unidade${stock !== 1 ? 's' : ''}</div></div></div>`;
      }).join('');
  }

  renderLowStock();
  window.addEventListener('pageshow', renderLowStock);

  // Não há sistema de login ainda (previsto para quando o backend for implementado);
  // por enquanto o botão só retorna à tela inicial.
  document.getElementById('btn-logout').addEventListener('click', () => {
    window.location.href = '../index.html';
  });
});
