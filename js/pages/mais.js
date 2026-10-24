document.addEventListener('DOMContentLoaded', async function() {
  const lowStockList = document.getElementById('low-stock-list');

  async function renderProfile() {
    const profile = await getCurrentProfile();
    if (!profile) return;
    document.getElementById('profile-name').textContent = profile.nome;
    document.getElementById('profile-role').textContent = profile.role === 'administrador' ? 'Administrador' : 'Funcionário';
  }

  async function renderLowStock() {
    const products = (await ProductManager.getAll()).filter(product => (Number(product.stock) || 0) <= 10);

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

  await renderProfile();
  await renderLowStock();
  window.addEventListener('pageshow', renderLowStock);

  document.getElementById('btn-logout').addEventListener('click', () => {
    logoutAndRedirect();
  });
});
