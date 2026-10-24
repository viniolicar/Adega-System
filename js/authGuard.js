// Roda IMEDIATAMENTE (antes do resto da página aparecer), em toda tela
// protegida do sistema. Se não houver sessão de login válida, redireciona
// para a tela de login antes de mostrar qualquer dado.
document.documentElement.setAttribute('data-auth', 'checking');

(async function () {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) {
    const target = window.location.pathname.includes('/html/') ? '../login.html' : 'login.html';
    window.location.href = target;
    return;
  }
  document.documentElement.setAttribute('data-auth', 'ok');
})();
