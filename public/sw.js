// Meeting Debrief — Service Worker
// Cache strategy: network-first for navigation, cache-first for static assets.
// /api/* and /auth/* are NEVER cached — they must always hit the network.

const CACHE_NAME = 'meeting-debrief-v1'
const OFFLINE_URL = '/offline'
const PRECACHE_URLS = [OFFLINE_URL]

// ──────────────────────────────────────────────────
// Install: pre-cache the offline fallback page
// ──────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  )
})

// ──────────────────────────────────────────────────
// Activate: clean up old caches from previous versions
// ──────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ──────────────────────────────────────────────────
// Fetch: routing logic
// ──────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return

  // Never cache API or auth routes — always pass through to network
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
    return
  }

  // Navigation requests: network-first, fall back to offline page
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request))
    return
  }

  // Static assets (JS, CSS, fonts, images): cache-first, update in background
  const isStaticAsset =
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image') ||
    url.pathname.match(/\.(js|css|woff2?|ttf|eot|png|jpg|jpeg|svg|ico|webp)$/)

  if (isStaticAsset) {
    event.respondWith(cacheFirstWithNetworkUpdate(request))
    return
  }
})

/**
 * Network-first strategy. Falls back to the offline page when both network
 * and cache fail — only used for navigation (HTML) requests.
 */
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request)
    // Cache successful navigation responses for offline fallback
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    const offlinePage = await caches.match(OFFLINE_URL)
    if (offlinePage) return offlinePage

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

/**
 * Cache-first strategy with a background network update (stale-while-revalidate).
 * Used for static assets that change infrequently.
 */
async function cacheFirstWithNetworkUpdate(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)

  // Kick off a background refresh regardless
  const networkFetch = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone())
      return response
    })
    .catch(() => {
      /* network unavailable — cached copy will be used */
    })

  if (cached) return cached

  // Nothing in cache yet — wait for the network
  return networkFetch
}
