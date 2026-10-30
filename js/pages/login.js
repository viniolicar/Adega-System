document.addEventListener('DOMContentLoaded', async () => {
  // Se já existe uma sessão válida, não faz sentido mostrar o login de novo.
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    window.location.href = 'index.html';
    return;
  }

  const form = document.getElementById('login-form');
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('btn-login');
  const passwordInput = document.getElementById('login-password');
  const togglePasswordBtn = document.getElementById('btn-toggle-password');

  togglePasswordBtn.addEventListener('click', () => {
    const show = passwordInput.type === 'password';
    passwordInput.type = show ? 'text' : 'password';
    togglePasswordBtn.classList.toggle('is-visible', show);
    togglePasswordBtn.setAttribute('aria-label', show ? 'Esconder senha' : 'Mostrar senha');
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    errorEl.style.display = 'none';

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'ENTRANDO...';

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'ENTRAR';
      errorEl.textContent = 'Email ou senha incorretos.';
      errorEl.style.display = 'block';
      return;
    }

    window.location.href = 'index.html';
  });
});
