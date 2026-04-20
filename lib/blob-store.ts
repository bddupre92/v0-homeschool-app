/**
 * IndexedDB blob store — holds photo/voice blobs that are too large
 * to sit in localStorage. Captures in atoz-store reference these by
 * blobId; the blob itself stays here, yielded as Object URLs on demand.
 *
 * v1: single object store, one DB, no migrations. When v2 adds sync,
 * the same ids will become cloud keys.
 */

const DB_NAME = "atoz.blobs"
const DB_VERSION = 1
const STORE = "blobs"

let dbPromise: Promise<IDBDatabase> | null = null

function getDB(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("IndexedDB is not available"))
  }
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error ?? new Error("blob store open failed"))
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
  })
  return dbPromise
}

export async function putBlob(id: string, blob: Blob): Promise<void> {
  const db = await getDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite")
    tx.objectStore(STORE).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error("putBlob failed"))
  })
}

export async function getBlob(id: string): Promise<Blob | undefined> {
  const db = await getDB()
  return new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly")
    const req = tx.objectStore(STORE).get(id)
    req.onsuccess = () => resolve(req.result as Blob | undefined)
    req.onerror = () => reject(req.error ?? new Error("getBlob failed"))
  })
}

export async function deleteBlob(id: string): Promise<void> {
  const db = await getDB()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite")
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error("deleteBlob failed"))
  })
}

/** Return a fresh Object URL for the blob. Caller is responsible for URL.revokeObjectURL. */
export async function getBlobUrl(id: string): Promise<string | undefined> {
  const blob = await getBlob(id)
  return blob ? URL.createObjectURL(blob) : undefined
}

/** 100KB — threshold above which we route to IndexedDB instead of a data URL. */
export const BLOB_SIZE_THRESHOLD = 100 * 1024

/**
 * Persist a blob and return the shape a Capture expects. Small blobs
 * (< 100KB) are returned as inline dataUrls so localStorage renders
 * without a blob-store read; larger ones land in IndexedDB under a
 * fresh blobId.
 */
export async function saveCaptureMedia(
  blob: Blob,
  idPrefix = "blob",
): Promise<{ dataUrl?: string; blobId?: string; mimeType: string }> {
  const mimeType = blob.type || "application/octet-stream"
  if (blob.size <= BLOB_SIZE_THRESHOLD) {
    const dataUrl = await blobToDataUrl(blob)
    return { dataUrl, mimeType }
  }
  const blobId = `${idPrefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
  await putBlob(blobId, blob)
  return { blobId, mimeType }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result)
      else reject(new Error("FileReader produced non-string"))
    }
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"))
    reader.readAsDataURL(blob)
  })
}
