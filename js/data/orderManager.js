// Camada de dados de PEDIDOS — agora conversando com o banco (Supabase).
// Criar, editar e excluir pedido chamam funções especiais do banco
// (create_order / update_order / delete_order) que fazem TUDO numa
// única operação: se o estoque não for suficiente, nada é salvo — nem
// o pedido, nem o desconto do estoque. Isso é o que garante que dois
// funcionários vendendo o último item ao mesmo tempo nunca deixem o
// estoque errado.

function mapOrderRow(row) {
  const created = new Date(row.created_at);
  return {
    id: row.code,
    customerName: row.customer_name,
    status: row.status,
    total: Number(row.total),
    date: created.toLocaleDateString('pt-BR'),
    time: created.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    items: (row.order_items || []).map(item => ({
      productId: item.product_id,
      name: item.name,
      category: item.category,
      price: Number(item.price),
      quantity: item.quantity,
      subtotal: Number(item.subtotal)
    }))
  };
}

const OrderManager = {
  async getAll() {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*, order_items(*)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Erro ao buscar pedidos:', error);
      return [];
    }
    return data.map(mapOrderRow);
  },

  async getById(code) {
    const { data, error } = await supabaseClient
      .from('orders')
      .select('*, order_items(*)')
      .eq('code', code)
      .single();
    if (error || !data) return null;
    return mapOrderRow(data);
  },

  // items: [{ productId, name, category, price, quantity }]
  // Devolve o código do pedido criado (ex: "PED0001").
  // Lança um erro (com mensagem legível) se o estoque não bastar.
  async create(customerName, employeeId, items) {
    const { data, error } = await supabaseClient.rpc('create_order', {
      p_customer_name: customerName,
      p_employee_id: employeeId,
      p_items: items
    });
    if (error) throw error;
    return data && data[0] ? data[0].order_code : null;
  },

  async updateItems(code, customerName, items) {
    const { error } = await supabaseClient.rpc('update_order', {
      p_order_code: code,
      p_customer_name: customerName,
      p_items: items
    });
    if (error) throw error;
  },

  async remove(code, restock) {
    const { error } = await supabaseClient.rpc('delete_order', {
      p_order_code: code,
      p_restock: restock
    });
    if (error) throw error;
  }
};
