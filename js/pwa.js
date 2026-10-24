// Registra o service worker (o que deixa o site instalável como app).
// O caminho do sw.js é descoberto a partir do próprio endereço deste script,
// assim funciona tanto nas páginas da raiz quanto nas da pasta html/.
(function () {
  if (!('serviceWorker' in navigator)) return;

  var script = document.currentScript;
  if (!script) return;

  var swUrl = script.src.replace('js/pwa.js', 'sw.js');
  window.addEventListener('load', function () {
    navigator.serviceWorker.register(swUrl).catch(function () {});
  });
})();
