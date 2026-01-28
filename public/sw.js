const CACHE_NAME = 'econuru-v1'
const CLIENT_SCOPE = '/'

// Client-specific service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker (Client): Installing...')
  // Store installation context as client
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.put(new Request('/client-install-flag'), new Response('client'))
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker (Client): Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete admin caches if they exist
          if (cacheName.startsWith('econuru-admin')) {
            console.log('Service Worker (Client): Deleting admin cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Client fetch handler - enforces client-only access
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return
  
  const url = new URL(event.request.url)
  const isAdminRequest = url.pathname.startsWith('/admin')
  
  // Enforce client-only access - redirect admin navigation requests
  if (event.request.mode === 'navigate' && isAdminRequest) {
    event.respondWith(
      Response.redirect(new URL('/', event.request.url), 302)
    )
    return
  }
  
  // Let all client requests go through normally
  event.respondWith(
    fetch(event.request).catch(() => {
      // Only for navigation requests, show a simple offline message
      if (event.request.mode === 'navigate') {
        return new Response(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Offline - Econuru</title>
            <style>
              body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
              h1 { color: #6366f1; }
            </style>
          </head>
          <body>
            <h1>Econuru</h1>
            <p>You're currently offline</p>
            <p>Please check your internet connection</p>
            <button onclick="location.reload()">Try Again</button>
          </body>
          </html>
        `, {
          headers: { 'Content-Type': 'text/html' }
        })
      }
    })
  )
}) 