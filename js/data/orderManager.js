const OrderManager = {
  storageKey: 'adega_orders',
  getAll() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  },
  add(order) {
    const orders = this.getAll();
    const now = new Date();
    order.id = `PED${String(orders.length + 1).padStart(4, '0')}`;
    order.date = now.toLocaleDateString('pt-BR');
    order.time = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    order.status = 'Finalizado';
    orders.push(order);
    localStorage.setItem(this.storageKey, JSON.stringify(orders));
  }
};
