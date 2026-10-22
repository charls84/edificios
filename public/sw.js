// Service worker de Torna v1
// CRITICO: no interceptar "fetch" (rompe la PWA en iOS Safari). Solo ciclo de vida
// y limpieza de caches viejos; las notificaciones push se agregaran aqui si se piden.
const CACHE_NAME = 'torna-v1'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((nombres) => Promise.all(nombres.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting()
})
