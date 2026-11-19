// Service Worker for JurisTV offline app
// URL of the manifest on GitHub Pages
const MANIFEST_URL = 'https://oscarjf24.github.io/juristv-normas/manifest.json';

// Helper to build the URL for each norma file
const FILE_URL = (law) => `https://oscarjf24.github.io/juristv-normas/${law.archivo}`;

self.addEventListener('install', (event) => {
  // Pre‑cache static assets (optional)
  event.waitUntil(
    caches.open('juristv-static-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/css/style.css',
        '/js/main.js',
        '/js/juristv_data.js',
        '/js/cgp_data.js',
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // If the request is for the manifest, proxy it to GitHub Pages
  if (url.pathname.endsWith('/manifest.json')) {
    event.respondWith(fetch(MANIFEST_URL, { cache: 'no-store' }));
    return;
  }

  // If the request matches a norma file (e.g. /ley_1564_2012.json.gz)
  const match = url.pathname.match(/^\/([^\/]+\.json\.gz)$/);
  if (match) {
    const law = { archivo: match[1] };
    event.respondWith(fetch(FILE_URL(law), { cache: 'no-store' }));
    return;
  }

  // Default: try network first, fallback to cache
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
