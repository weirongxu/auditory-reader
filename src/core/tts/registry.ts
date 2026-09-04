import type { TtsProvider, TtsProviderId } from './types.js'

class TtsRegistry {
  #providers = new Map<TtsProviderId, TtsProvider>()

  register(provider: TtsProvider): void {
    this.#providers.set(provider.id, provider)
  }

  get(id: TtsProviderId): TtsProvider | undefined {
    return this.#providers.get(id)
  }

  list(): TtsProvider[] {
    return [...this.#providers.values()]
  }

  getDefault(): TtsProvider | undefined {
    return this.#providers.values().next().value
  }
}

export const registry = new TtsRegistry()
