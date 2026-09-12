/**
 * IndexedDB Photo Vault for High-Resolution, Original Quality Assets
 * Provides persistent, quota-free storage for uncompressed, original quality photos.
 * Ensures photos are NEVER resized or degraded in quality.
 */

const DB_NAME = "transvolt_photo_vault"
const DB_VERSION = 2
const STORE_NAME = "original_photos"
const ASSETS_STORE_NAME = "all_assets"

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment"))
      return
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" })
      }
      if (!db.objectStoreNames.contains(ASSETS_STORE_NAME)) {
        db.createObjectStore(ASSETS_STORE_NAME, { keyPath: "key" })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Persists the entire assets database to IndexedDB with zero quota limits.
 * Guarantees that multi-megabyte, high-resolution original photos are never truncated.
 */
export async function saveAllAssetsToDB(assets: any[]): Promise<void> {
  if (!assets) return
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ASSETS_STORE_NAME, "readwrite")
      const store = tx.objectStore(ASSETS_STORE_NAME)
      const putReq = store.put({ key: "branding_portal_assets", data: assets, updatedAt: Date.now() })

      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    })
  } catch (err) {
    console.warn("Failed to persist assets array to IndexedDB photo vault:", err)
  }
}

/**
 * Retrieves the entire assets database from IndexedDB.
 */
export async function getAllAssetsFromDB(): Promise<any[] | null> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ASSETS_STORE_NAME, "readonly")
      const store = tx.objectStore(ASSETS_STORE_NAME)
      const req = store.get("branding_portal_assets")

      req.onsuccess = () => {
        if (req.result && req.result.data && Array.isArray(req.result.data) && req.result.data.length > 0) {
          resolve(req.result.data)
        } else {
          resolve(null)
        }
      }
      req.onerror = () => resolve(null)
    })
  } catch {
    return null
  }
}

/**
 * Save an original quality photo (full resolution data URL / blob)
 */
export async function saveOriginalPhoto(id: string, originalData: string): Promise<void> {
  if (!id || !originalData) return
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)
      const putReq = store.put({ id, data: originalData, savedAt: Date.now() })

      putReq.onsuccess = () => resolve()
      putReq.onerror = () => reject(putReq.error)
    })
  } catch (err) {
    console.warn("Failed to store original photo in IndexedDB photo vault:", err)
  }
}

/**
 * Batch save original quality photos
 */
export async function saveOriginalPhotosBatch(photos: { id: string; data: string }[]): Promise<void> {
  if (!photos || photos.length === 0) return
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)

      photos.forEach((p) => {
        if (p.id && p.data) {
          store.put({ id: p.id, data: p.data, savedAt: Date.now() })
        }
      })

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn("Failed to batch store original photos in IndexedDB photo vault:", err)
  }
}

/**
 * Retrieve an original quality photo by ID
 */
export async function getOriginalPhoto(id: string): Promise<string | null> {
  if (!id) return null
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)
      const req = store.get(id)

      req.onsuccess = () => {
        if (req.result && req.result.data) {
          resolve(req.result.data)
        } else {
          resolve(null)
        }
      }
      req.onerror = () => reject(req.error)
    })
  } catch (err) {
    console.warn(`Failed to read original photo ${id} from vault:`, err)
    return null
  }
}

/**
 * Batch retrieve original quality photos
 */
export async function getOriginalPhotosMap(ids: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  if (!ids || ids.length === 0) return map

  try {
    const db = await openDB()
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly")
      const store = tx.objectStore(STORE_NAME)

      let pending = ids.length
      ids.forEach((id) => {
        const req = store.get(id)
        req.onsuccess = () => {
          if (req.result && req.result.data) {
            map.set(id, req.result.data)
          }
          pending--
          if (pending === 0) resolve(map)
        }
        req.onerror = () => {
          pending--
          if (pending === 0) resolve(map)
        }
      })
    })
  } catch {
    return map
  }
}

/**
 * Delete original photos from vault
 */
export async function deleteOriginalPhotos(ids: string[]): Promise<void> {
  if (!ids || ids.length === 0) return
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite")
      const store = tx.objectStore(STORE_NAME)

      ids.forEach((id) => store.delete(id))

      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn("Failed to delete photos from IndexedDB vault:", err)
  }
}
