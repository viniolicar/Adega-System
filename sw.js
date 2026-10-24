// Service worker do Adega System.
// Guarda uma cópia dos arquivos do app para ele abrir rápido e continuar abrindo
// mesmo sem internet. Os dados (produtos, estoque, pedidos) NUNCA são guardados aqui:
// pedidos ao Supabase passam direto pela rede, sempre atualizados.
const CACHE = 'adega-v1';

const SHELL = [
  './',
  'index.html',
  'login.html',
  'html/estoque.html',
  'html/pedidos.html',
  'html/mais.html',
  'css/style.css',
  'js/theme.js',
  'js/utils.js',
  'js/auth.js',
  'js/authGuard.js',
  'js/supabaseClient.js',
  'js/pwa.js',
  'js/data/productManager.js',
  'js/data/orderManager.js',
  'js/pages/index.js',
  'js/pages/login.js',
  'js/pages/estoque.js',
  'js/pages/pedidos.js',
  'js/pages/mais.js',
  'img/adega_logo.jpg',
  'img/icons/icon-192.png',
  'img/icons/icon-512.png',
  'manifest.webmanifest'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Rede primeiro (assim toda atualização do app chega na hora); se estiver sem
// internet, usa a cópia guardada.
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('login.html')))
  );
});
