// Fotos subidas en el navegador (modo demo): se guardan en IndexedDB.
// En la Fase 1 este modulo se reemplaza por Supabase Storage.
const DB = 'torna-fotos'
const STORE = 'fotos'
const PREFIJO = 'idb:'

export const esFotoLocal = (src: string) => src.startsWith(PREFIJO)

function abrir(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1)
    req.onupgradeneeded = () => req.result.createObjectStore(STORE)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function operar<T>(modo: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await abrir()
  return new Promise((resolve, reject) => {
    const req = fn(db.transaction(STORE, modo).objectStore(STORE))
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function guardarFoto(blob: Blob): Promise<string> {
  const id = crypto.randomUUID()
  await operar('readwrite', (s) => s.put(blob, id))
  return PREFIJO + id
}

export async function leerFoto(src: string): Promise<Blob | null> {
  return (await operar<Blob | undefined>('readonly', (s) => s.get(src.slice(PREFIJO.length)))) ?? null
}

export async function borrarFotos(srcs: string[]) {
  for (const src of srcs.filter(esFotoLocal)) {
    await operar('readwrite', (s) => s.delete(src.slice(PREFIJO.length))).catch(() => undefined)
  }
}

// Reduce la foto a maximo 1600 px y la recodifica en JPEG: pesa menos y pierde
// los metadatos de la camara (incluida la ubicacion GPS).
export async function comprimirImagen(file: File, max = 1600): Promise<Blob> {
  const bmp = await createImageBitmap(file)
  const escala = Math.min(1, max / Math.max(bmp.width, bmp.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bmp.width * escala)
  canvas.height = Math.round(bmp.height * escala)
  canvas.getContext('2d')!.drawImage(bmp, 0, 0, canvas.width, canvas.height)
  bmp.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('No se pudo procesar la foto'))), 'image/jpeg', 0.82)
  )
}
