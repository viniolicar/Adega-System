function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function formatPrice(value) {
  return Number(value).toFixed(2).replace('.', ',');
}
