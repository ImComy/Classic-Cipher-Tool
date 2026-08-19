import type { Session } from '../types'

const DB_NAME = 'CryptoToolDB'
const STORE_NAME = 'sessions'

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = e => {
      const db = (e.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function loadSessionsFromDB(): Promise<Session[]> {
  try {
    const db = await openDB()
    return new Promise(resolve => {
      const tx = db.transaction(STORE_NAME, 'readonly')
      const store = tx.objectStore(STORE_NAME)
      const request = store.get('all_sessions')
      request.onsuccess = () => resolve(request.result ? request.result.data : [])
      request.onerror = () => resolve([])
    })
  } catch {
    return []
  }
}

export async function saveSessionsToDB(sessions: Session[]): Promise<void> {
  try {
    const db = await openDB()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.put({ id: 'all_sessions', data: sessions })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } catch (e) {
    console.error('DB save error', e)
  }
}