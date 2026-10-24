// Conexão com o banco de dados (Supabase). Esses dois valores são
// seguros de ficar no código do site — o Supabase usa outras regras
// (Row Level Security) para proteger os dados, não o sigilo desta chave.
const SUPABASE_URL = 'https://aomqyqwjagqckyxszigj.supabase.co';
const SUPABASE_KEY = 'sb_publishable___3WJgX1WHbg6KaMMzKVcQ_2196QWXV';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
