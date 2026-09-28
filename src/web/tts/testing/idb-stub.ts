import { vi } from 'vitest'

// Minimal fake indexedDB so node vitest env can exercise the cache paths.
// `idb` identifies native objects via `instanceof IDBRequest / IDBDatabase /
// IDBObjectStore / IDBTransaction` and awaits `tx.done` via the transaction's
// 'complete' event, so the stub provides those globals as plain classes and
// fires 'complete' asynchronously after each store operation.
const store = new Map<string, unknown>()

// Fault injection: one queued failure per store operation kind.
const pendingFailures = new Map<'get' | 'put' | 'delete', string>()

/**
 * Make the next `get`/`put`/`delete` store operation fail with `error`.
 * Targeted by operation kind so fire-and-forget paths (which perform reads
 * before the failing write) can be tested without sequencing tricks.
 */
export function failNextIdbOperation(
  operation: 'get' | 'put' | 'delete',
  error: string,
): void {
  pendingFailures.set(operation, error)
}

function consumeFailure(
  operation: 'get' | 'put' | 'delete',
): DOMException | null {
  const error = pendingFailures.get(operation)
  if (error === undefined) return null
  pendingFailures.delete(operation)
  return new DOMException(error, 'AbortError')
}

/** Read a raw store entry for assertions (unknown: entries may be corrupt). */
export function getEntry(key: string): unknown {
  return store.get(key)
}

export function hasEntry(key: string): boolean {
  return store.has(key)
}

/** Seed a raw store entry, bypassing cachePut validation (e.g. corrupt data). */
export function seedEntry(key: string, value: unknown): void {
  store.set(key, value)
}

class IDBRequestStub<T> extends EventTarget {
  result: T
  error: DOMException | null = null
  source: null = null
  transaction: IDBTransactionStub | null = null
  readyState = 'done' as const

  constructor(result: T) {
    super()
    this.result = result
  }
}

class IDBDatabaseStub extends EventTarget {
  name = 'tts-cache'
  version = 1
  objectStoreNames = {
    0: 'speak',
    length: 1,
    contains: (name: string) => name === 'speak',
  }
  onabort: ((ev: Event) => unknown) | null = null
  onclose: ((ev: Event) => unknown) | null = null
  onerror: ((ev: Event) => unknown) | null = null
  onversionchange: ((ev: Event) => unknown) | null = null

  close(): void {}
  createObjectStore(): IDBObjectStoreStub {
    return fakeStore
  }
  transaction(): IDBTransactionStub {
    currentTx = new IDBTransactionStub(['speak'])
    return currentTx
  }
  deleteObjectStore(): void {}
}

class IDBTransactionStub extends EventTarget {
  mode = 'readwrite' as const
  db: IDBDatabaseStub | null = null
  error: DOMException | null = null
  onabort: ((ev: Event) => unknown) | null = null
  oncomplete: ((ev: Event) => unknown) | null = null
  onerror: ((ev: Event) => unknown) | null = null

  constructor(public objectStoreNames: string[]) {
    super()
  }

  abort(): void {}

  objectStore(): IDBObjectStoreStub {
    return fakeStore
  }

  complete(): void {
    this.dispatchEvent(new Event('complete'))
  }
}

// Only the surface cache.ts touches is provided. Prototype methods must exist
// so `idb`'s cached-method generation treats them as readable/writable ops.
class IDBObjectStoreStub {
  get(key: string): IDBRequestStub<unknown> {
    // Reads: only the request rejects; firing tx 'error' would leave idb's
    // unawaited tx.done promise rejecting unhandled.
    return fakeRequest(store.get(key), consumeFailure('get'), false)
  }
  put(value: unknown, key: string): IDBRequestStub<string> {
    store.set(key, value)
    return fakeRequest(key, consumeFailure('put'))
  }
  delete(key: string): IDBRequestStub<undefined> {
    store.delete(key)
    return fakeRequest(undefined, consumeFailure('delete'))
  }
}

// Required by `idb`'s instanceof-based type dispatch; never constructed here.
function IDBIndexStub(): void {}
function IDBCursorStub(): void {}

// Single-op transactions only: the store records the tx opened by
// db.transaction() so the resulting request completes it.
let currentTx: IDBTransactionStub | undefined

function fakeRequest<T>(
  result: T,
  error: DOMException | null = null,
  failTransaction = true,
): IDBRequestStub<T> {
  const request = new IDBRequestStub(result)
  request.transaction = currentTx ?? null
  setTimeout(() => {
    // Mirror native semantics: request fires 'error' with request.error set,
    // then the transaction fires 'error' so `idb`'s tx.done also rejects.
    if (error) {
      request.error = error
      request.dispatchEvent(new Event('error'))
      // Writes: idb awaits tx.done too, so it must reject as well.
      if (request.transaction && failTransaction) {
        request.transaction.error = error
        request.transaction.dispatchEvent(new Event('error'))
      }
      return
    }
    request.dispatchEvent(new Event('success'))
    // Complete the transaction that opened THIS request, not the latest one.
    request.transaction?.complete()
  }, 0)
  return request
}

const fakeStore = new IDBObjectStoreStub()

const fakeDb = new IDBDatabaseStub()

export function stubIdb(): void {
  // Reset state so repeated stubIdb() calls (and suites re-importing cache.js)
  // start from a clean, decoupled store.
  store.clear()
  pendingFailures.clear()
  vi.stubGlobal('IDBRequest', IDBRequestStub)
  vi.stubGlobal('IDBDatabase', IDBDatabaseStub)
  vi.stubGlobal('IDBTransaction', IDBTransactionStub)
  vi.stubGlobal('IDBObjectStore', IDBObjectStoreStub)
  vi.stubGlobal('IDBIndex', IDBIndexStub)
  vi.stubGlobal('IDBCursor', IDBCursorStub)
  vi.stubGlobal('indexedDB', {
    open: () => {
      const request = new IDBRequestStub(fakeDb)
      setTimeout(() => {
        request.dispatchEvent(new Event('upgradeneeded'))
        request.dispatchEvent(new Event('success'))
      }, 0)
      return request
    },
  })
}
