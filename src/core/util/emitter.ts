type Disposable = () => void

export class Emitter<T extends Record<string, any>> {
  #listeners = new Map<string, ((value: any) => void | Promise<void>)[]>()

  on<K extends keyof T & string>(
    name: K,
    callback: (value: T[K]) => void | Promise<void>,
  ): Disposable {
    let listeners = this.#listeners.get(name)
    if (!listeners) {
      listeners = []
      this.#listeners.set(name, listeners)
    }
    listeners.push(callback)
    return () => {
      if (!listeners) return
      const idx = listeners.findIndex(callback as any)
      if (idx === -1) return
      listeners.splice(idx, 1)
    }
  }

  fire<K extends keyof T & string>(name: K, value: T[K]) {
    const listeners = this.#listeners.get(name)
    if (!listeners) return
    for (const listener of listeners) {
      Promise.resolve(listener.call(null, value)).catch(console.error)
    }
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
    if (value === undefined) return

    const lastValue = this.#lastValues.get(name)
    if (lastValue === undefined || lastValue !== value) {
      this.#lastValues.set(name, value)
      super.fire(name, value)
    }
  }
}
