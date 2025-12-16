const CACHE_NAME = 'econuru-admin-v1'

// Admin-specific service worker
self.addEventListener('install', (event) => {
  console.log('Service Worker (Admin): Installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('Service Worker (Admin): Activating...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old caches that aren't admin-specific
          if (cacheName !== CACHE_NAME && cacheName.startsWith('econuru-admin')) {
            console.log('Service Worker (Admin): Deleting old cache', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Cache admin pages and assets
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return
  
  // Only cache admin-related requests
  if (event.request.url.includes('/admin')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        // Return cached version if available
        if (response) {
          return response
        }
        
        // Otherwise fetch from network
        return fetch(event.request).then((response) => {
          // Don't cache if not a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response
          }
          
          // Clone the response
          const responseToCache = response.clone()
          
          // Cache the response
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
          
          return response
        }).catch(() => {
          // If fetch fails and it's a navigation request, show offline page
          if (event.request.mode === 'navigate') {
            return new Response(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>Offline - Econuru Admin</title>
                <style>
                  body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                  h1 { color: #6366f1; }
                </style>
              </head>
              <body>
                <h1>Econuru Admin</h1>
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
      })
    )
  } else {
    // For non-admin requests, just fetch normally
    event.respondWith(fetch(event.request))
  }
})

