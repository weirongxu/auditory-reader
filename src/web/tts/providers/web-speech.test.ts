import { afterEach, describe, expect, it, vi } from 'vitest'

import { WebSpeechProvider } from './web-speech.js'

type Listener = (event?: unknown) => void

class FakeUtterance {
  static instances: FakeUtterance[] = []

  listeners = new Map<string, Listener[]>()
  #onceNames = new Map<string, Set<Listener>>()
  text = ''
  voice: unknown = null
  rate = 1

  constructor() {
    FakeUtterance.instances.push(this)
  }

  addEventListener(
    name: string,
    listener: Listener,
    options?: { once?: boolean },
  ): void {
    this.listeners.set(name, [...(this.listeners.get(name) ?? []), listener])
    if (options?.once) {
      this.#onceNames.set(
        name,
        new Set(this.#onceNames.get(name)).add(listener),
      )
    }
  }

  removeEventListener(name: string, listener?: Listener): void {
    if (!listener) {
      this.listeners.delete(name)
      this.#onceNames.delete(name)
      return
    }
    const remaining = (this.listeners.get(name) ?? []).filter(
      (it) => it !== listener,
    )
    if (remaining.length) this.listeners.set(name, remaining)
    else {
      this.listeners.delete(name)
      this.#onceNames.delete(name)
    }
  }

  emit(name: string, event?: unknown): void {
    const once = this.#onceNames.get(name)
    for (const listener of this.listeners.get(name) ?? []) {
      if (once?.has(listener)) this.removeEventListener(name, listener)
      listener(event)
    }
  }
}

class FakeSpeechSynthesis {
  speaking = false
  private listeners = new Map<string, Listener>()

  getVoices(): unknown[] {
    return []
  }

  speak(): void {
    this.speaking = true
  }

  cancel(): void {
    this.speaking = false
  }

  addEventListener(name: string, listener: Listener): void {
    this.listeners.set(name, listener)
  }

  emit(name: string): void {
    this.listeners.get(name)?.()
  }
}

const stubBrowserGlobals = () => {
  const synthesis = new FakeSpeechSynthesis()
  FakeUtterance.instances = []
  vi.stubGlobal('speechSynthesis', synthesis)
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  return { synthesis }
}

const speakOptions = (speed = 1) => ({
  voice: {
    providerId: 'webSpeech' as const,
    voiceId: '0',
    name: 'v',
    lang: 'en',
    isServerTts: false,
  },
  speed,
})

describe('WebSpeechProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    FakeUtterance.instances = []
  })

  it('rejects when the utterance emits an error event without cancel', async () => {
    stubBrowserGlobals()
    const provider = new WebSpeechProvider()

    const promise = provider.speak('hi', speakOptions())

    const utterance = FakeUtterance.instances.at(-1)
    utterance?.emit('error', { error: 'synthesis-failed' })

    await expect(promise).rejects.toThrow('synthesis-failed')
  })

  it('resolves cancel when canceled while speaking', async () => {
    stubBrowserGlobals()
    const provider = new WebSpeechProvider()

    const promise = provider.speak('hi', speakOptions())

    provider.cancel()

    const utterance = FakeUtterance.instances.at(-1)
    utterance?.emit('error', { error: 'canceled' })

    await expect(promise).resolves.toBe('cancel')
  })

  it('resolves done when the utterance ends naturally', async () => {
    stubBrowserGlobals()
    const provider = new WebSpeechProvider()

    const promise = provider.speak('hi', speakOptions())

    const utterance = FakeUtterance.instances.at(-1)
    utterance?.emit('end')

    await expect(promise).resolves.toBe('done')
  })

  it('resolves cancel immediately when the signal aborts during speak', async () => {
    stubBrowserGlobals()
    const provider = new WebSpeechProvider()
    const controller = new AbortController()

    const promise = provider.speak('hi', {
      ...speakOptions(),
      signal: controller.signal,
    })
    controller.abort()

    await expect(promise).resolves.toBe('cancel')
  })

  it('ignores the late end event after abort', async () => {
    stubBrowserGlobals()
    const provider = new WebSpeechProvider()
    const controller = new AbortController()

    const promise = provider.speak('hi', {
      ...speakOptions(),
      signal: controller.signal,
    })
    controller.abort()
    await expect(promise).resolves.toBe('cancel')

    const utterance = FakeUtterance.instances.at(-1)
    expect(() => utterance?.emit('end')).not.toThrow()
    expect(() =>
      controller.signal.dispatchEvent(new Event('abort')),
    ).not.toThrow()
  })

  it('resolves the previous speak as cancel when a new speak supersedes it', async () => {
    stubBrowserGlobals()
    const provider = new WebSpeechProvider()

    const first = provider.speak('first', speakOptions())
    const second = provider.speak('second', speakOptions())

    await expect(first).resolves.toBe('cancel')

    FakeUtterance.instances[0]?.emit('end')

    const secondUtterance = FakeUtterance.instances.at(-1)
    secondUtterance?.emit('end')
    await expect(second).resolves.toBe('done')
  })

  it('cleans up the signal and boundary listeners after settle', async () => {
    stubBrowserGlobals()
    const provider = new WebSpeechProvider()
    const controller = new AbortController()
    const signal = controller.signal
    const onBoundary = vi.fn()

    const promise = provider.speak('hi', {
      ...speakOptions(),
      signal,
      onBoundary,
    })
    const utterance = FakeUtterance.instances.at(-1)
    utterance?.emit('end')
    await expect(promise).resolves.toBe('done')

    // NOTE: end/error use `{ once: true }` and are not removed manually;
    // the untriggered error listener remains until GC, which is harmless
    expect(() => signal.dispatchEvent(new Event('abort'))).not.toThrow()
    expect(onBoundary).not.toHaveBeenCalled()
    expect(() => utterance?.emit('boundary', { charIndex: 0 })).not.toThrow()
    expect(onBoundary).not.toHaveBeenCalled()
    expect(() => provider.cancel()).not.toThrow()
    expect(() => utterance?.emit('end')).not.toThrow()
  })
})
