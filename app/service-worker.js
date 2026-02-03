// This is the service worker for the HomeScholar PWA

const CACHE_NAME = "homescholar-v1"

// Resources to pre-cache
const PRECACHE_URLS = [
  "/",
  "/dashboard",
  "/offline",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/favicon.ico",
]

// Install event - precache static resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  )
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const currentCaches = [CACHE_NAME]
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return cacheNames.filter((cacheName) => !currentCaches.includes(cacheName))
      })
      .then((cachesToDelete) => {
        return Promise.all(
          cachesToDelete.map((cacheToDelete) => {
            return caches.delete(cacheToDelete)
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch event - network-first strategy with fallback to cache
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip Firebase API requests
  if (event.request.url.includes("firebaseio.com") || event.request.url.includes("googleapis.com")) {
    return
  }

  // For HTML pages, use network-first strategy
  if (event.request.headers.get("accept").includes("text/html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache the latest version
          const responseClone = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
          return response
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse
            }
            // If not in cache, show offline page
            return caches.match("/offline")
          })
        }),
    )
    return
  }

  // For other assets, use cache-first strategy
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return from cache and update cache in background
        const fetchPromise = fetch(event.request).then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone())
          })
          return networkResponse
        })
        return cachedResponse
      }

      // If not in cache, fetch from network
      return fetch(event.request).then((response) => {
        // Cache the response for future
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone)
        })
        return response
      })
    }),
  )
})

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-resources") {
    event.waitUntil(syncResources())
  } else if (event.tag === "sync-boards") {
    event.waitUntil(syncBoards())
  }
})

// Push notification handler
self.addEventListener("push", (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/badge-icon.png",
      data: {
        url: data.url || "/",
      },
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  } catch (error) {
    console.error("Error showing notification:", error)
  }
})

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      const url = event.notification.data.url

      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === url && "focus" in client) {
          return client.focus()
        }
      }

      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    }),
  )
})

// Helper function for resource sync
async function syncResources() {
  // Implementation for syncing resources when back online
  const offlineResources = await getOfflineResources()

  for (const resource of offlineResources) {
    try {
      // Attempt to sync with server
      await fetch("/api/resources/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resource),
      })

      // If successful, remove from offline queue
      await removeOfflineResource(resource.id)
    } catch (error) {
      console.error("Failed to sync resource:", error)
    }
  }
}

// Helper function for board sync
async function syncBoards() {
  // Implementation for syncing boards when back online
  const offlineBoards = await getOfflineBoards()

  for (const board of offlineBoards) {
    try {
      // Attempt to sync with server
      await fetch("/api/boards/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(board),
      })

      // If successful, remove from offline queue
      await removeOfflineBoard(board.id)
    } catch (error) {
      console.error("Failed to sync board:", error)
    }
  }
}

// Helper functions to interact with IndexedDB for offline data
// These would be implemented to store and retrieve offline changes
async function getOfflineResources() {
  // Implementation to get resources from IndexedDB
  return []
}

async function removeOfflineResource(id) {
  // Implementation to remove a resource from IndexedDB
}

async function getOfflineBoards() {
  // Implementation to get boards from IndexedDB
  return []
}

async function removeOfflineBoard(id) {
  // Implementation to remove a board from IndexedDB
}
