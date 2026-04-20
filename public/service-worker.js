/**
 * AtoZ Family — minimal service worker.
 *
 * Strategy:
 * - Navigation requests: network-first, fall back to /offline when
 *   the network fails. This keeps every room (/today, /teach, /library
 *   etc.) usable when the device briefly drops offline — they ship a
 *   cached /offline shell instead of the browser's own error page.
 * - Static assets (next/_next/*, icons): cache-first so a returning
 *   user gets the app shell instantly.
 *
 * The app's primary data lives in localStorage / IndexedDB already,
 * so we don't try to cache API responses here — that would be a v2
 * offline-sync feature.
 */

const VERSION = "atoz-v1"
const STATIC_CACHE = `${VERSION}-static`
const OFFLINE_URL = "/offline"

const PRECACHE = [
  OFFLINE_URL,
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/manifest.json",
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("atoz-") && !k.startsWith(VERSION))
          .map((k) => caches.delete(k)),
      ),
    ).then(() => self.clients.claim()),
  )
})

self.addEventListener("fetch", (event) => {
  const req = event.request
  if (req.method !== "GET") return

  const url = new URL(req.url)

  // Navigation requests → network first, fall back to /offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match(OFFLINE_URL).then((res) => res ?? Response.error())),
    )
    return
  }

  // Next.js static assets → cache-first, fall back to network.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(req).then((cached) => {
        if (cached) return cached
        return fetch(req).then((res) => {
          if (res.ok && res.status === 200) {
            const clone = res.clone()
            caches.open(STATIC_CACHE).then((cache) => cache.put(req, clone))
          }
          return res
        })
      }),
    )
    return
  }

  // Everything else: pass through.
})
