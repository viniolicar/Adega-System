(function () {
  var STORAGE_KEY = 'adega_theme';

  function getStoredTheme() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  var currentTheme = getStoredTheme() === 'light' ? 'light' : 'dark';
  applyTheme(currentTheme);

  document.addEventListener('DOMContentLoaded', function () {
    var toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    var icon = toggle.querySelector('.theme-toggle-icon');
    var label = toggle.querySelector('.theme-toggle-label');

    function render() {
      var active = document.documentElement.getAttribute('data-theme');
      var isLight = active === 'light';
      if (icon) icon.textContent = isLight ? '☀' : '☾';
      if (label) label.textContent = isLight ? 'MODO CLARO' : 'MODO ESCURO';
      toggle.setAttribute('aria-checked', String(!isLight));
      toggle.setAttribute('aria-label', isLight ? 'Ativar modo escuro' : 'Ativar modo claro');
    }

    render();

    toggle.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      applyTheme(next);
      setStoredTheme(next);
      render();
    });
  });
})();
