// Funções de apoio para autenticação, usadas pelas páginas já logadas
// (diferente de authGuard.js, que roda ANTES de tudo para bloquear acesso).

async function getCurrentProfile() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return null;
  const { data, error } = await supabaseClient
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  if (error || !data) return null;
  return { id: session.user.id, nome: data.nome, role: data.role, status: data.status };
}

function loginPagePath() {
  return window.location.pathname.includes('/html/') ? '../login.html' : 'login.html';
}

async function logoutAndRedirect() {
  await supabaseClient.auth.signOut();
  window.location.href = loginPagePath();
}
