export class Emitter<T extends Record<string, any>> {
  #listeners = new Map<string, ((value: any) => void | Promise<void>)[]>()

  on<K extends keyof T & string>(
    name: K,
    callback: (value: T[K]) => void | Promise<void>
  ) {
    let listeners = this.#listeners.get(name)
    if (!listeners) {
      listeners = []
      this.#listeners.set(name, listeners)
    }
    listeners.push(callback)
    return () => {
      if (!listeners) return
      const idx = listeners.findIndex(() => callback)
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
}

/**
 * Emitter only fired when value changed
 */
export class ChangedEmitter<T extends Record<string, any>> extends Emitter<T> {
  #lastValues = new Map<string, unknown>()

  fire<K extends keyof T & string>(name: K, value: T[K]) {
    if (value === undefined) return

    const lastValue = this.#lastValues.get(name)
    if (lastValue === undefined || lastValue !== value) {
      this.#lastValues.set(name, value)
      super.fire(name, value)
    }
  }
}
