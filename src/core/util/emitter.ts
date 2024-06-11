type Disposable = () => void

type Callback<T> = (value: T) => void | Promise<void>

type Listener<T> = { cb: Callback<T>; options: OnOptions }

type OnOptions = { once?: boolean }

export class SingleEmitter<T> {
  #callbacks: Listener<T>[] = []

  constructor(protected defaultOptions: OnOptions = {}) {}

  on(callback: Callback<T>, options: OnOptions = {}): Disposable {
    const listener = {
      cb: callback,
      options: {
        ...this.defaultOptions,
        ...options,
      },
    }
    this.#callbacks.push(listener)

    return () => {
      this.off(listener)
    }
  }

  fire(value: T) {
    for (const callback of this.#callbacks) {
      if (callback.options.once) this.off(callback)
      Promise.resolve(callback.cb(value)).catch(console.error)
    }
  }

  off(callback: Listener<T>) {
    const idx = this.#callbacks.findIndex(() => callback)
    if (idx === -1) return
    this.#callbacks.splice(idx, 1)
  }
}

export class Emitter<T extends Record<string, any>> {
  #listeners = new Map<string, SingleEmitter<any>>()

  on<K extends keyof T & string>(
    name: K,
    callback: Callback<T[K]>,
  ): Disposable {
    let sEmitter = this.#listeners.get(name)
    if (!sEmitter) {
      sEmitter = new SingleEmitter()
      this.#listeners.set(name, sEmitter)
    }
    return sEmitter.on(callback)
  }

  fire<K extends keyof T & string>(name: K, value: T[K]) {
    const sEmitter = this.#listeners.get(name)
    if (!sEmitter) return
    Promise.resolve(sEmitter.fire(value)).catch(console.error)
  }

  off<K extends keyof T & string>(name: K) {
    this.#listeners.delete(name)
  }
}

/**
 * Emitter only fired when value changed
 */
export class ChangedEmitter<T extends Record<string, any>> extends Emitter<T> {
  #lastValues = new Map<string, unknown>()

  on<K extends keyof T & string>(
    name: K,
    callback: (value: T[K], prevValue?: T[K]) => void | Promise<void>,
  ): Disposable {
    return super.on(name, (value) =>
      callback(value, this.#lastValues.get(name) as T[K]),
    )
  }

  fire<K extends keyof T & string>(name: K, value: T[K]) {
    if (!this.#lastValues.has(name) || this.#lastValues.get(name) !== value) {
      this.#lastValues.set(name, value)
      super.fire(name, value)
    }
  }
}
