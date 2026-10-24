// Camada de dados de PRODUTOS — agora conversando com o banco de dados
// (Supabase) em vez do localStorage. Os nomes dos métodos continuam os
// mesmos de antes (getAll, getById, add, update, delete), mas agora
// todos são assíncronos (retornam uma "Promise"), porque toda operação
// precisa ir até a internet e voltar.
const ProductManager = {
  async getAll() {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
    return data.map(p => ({ id: p.id, name: p.name, category: p.category, price: Number(p.price), stock: p.stock }));
  },

  async getById(id) {
    const { data, error } = await supabaseClient.from('products').select('*').eq('id', id).single();
    if (error || !data) return null;
    return { id: data.id, name: data.name, category: data.category, price: Number(data.price), stock: data.stock };
  },

  async add(product) {
    const { data, error } = await supabaseClient
      .from('products')
      .insert({ name: product.name, category: product.category, price: product.price, stock: product.stock })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, patch) {
    const { error } = await supabaseClient.from('products').update(patch).eq('id', id);
    if (error) throw error;
  },

  async delete(id) {
    const { error } = await supabaseClient.from('products').delete().eq('id', id);
    if (error) throw error;
  }
};
