import { afterEach, describe, expect, it, vi } from 'vitest'

import { ServerTtsProvider } from './server.js'

type Listener = (event?: unknown) => void

const audioInstances: FakeAudio[] = []
let playFails = false

class FakeAudio {
  listeners = new Map<string, Listener>()
  paused = false
  played = false
  failPlay = playFails
  playReject: ((reason?: unknown) => void) | undefined

  constructor(public url: string) {
    audioInstances.push(this)
  }

  addEventListener(name: string, listener: Listener): void {
    this.listeners.set(name, listener)
  }

  play(): Promise<void> {
    this.played = true
    if (this.failPlay) {
      return new Promise((_resolve, reject) => {
        this.playReject = reject
      })
    }
    return Promise.resolve()
  }

  pause(): void {
    this.paused = true
  }

  emit(name: string): void {
    this.listeners.get(name)?.()
  }
}

const stubBrowserGlobals = () => {
  const revoked: string[] = []
  vi.stubGlobal('URL', {
    createObjectURL: (): string => 'blob:fake',
    revokeObjectURL: (url: string): void => {
      revoked.push(url)
    },
  })
  vi.stubGlobal('Audio', FakeAudio)
  vi.stubGlobal('console', { ...console, error: vi.fn() })
  return { revoked }
}

const stubFetchBlob = (blob: Blob) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(blob)),
  )
}

describe('ServerTtsProvider', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    audioInstances.length = 0
    playFails = false
  })

  it('rejects and cleans up when audio play is blocked', async () => {
    playFails = true
    const { revoked } = stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
    })

    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    const audio = audioInstances.at(-1)
    audio?.playReject?.(new Error('autoplay blocked'))

    await expect(promise).rejects.toThrow('tts audio playback failed')
    expect(audio?.paused).toBe(true)
    expect(revoked).toEqual(['blob:fake'])
  })

  it('resolves cancel when audio play is blocked after cancel', async () => {
    const { revoked } = stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
    })

    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    const audio = audioInstances.at(-1)
    provider.cancel()
    audio?.playReject?.(new Error('autoplay blocked'))

    await expect(promise).resolves.toBe('cancel')
    expect(audio?.paused).toBe(true)
    expect(revoked).toEqual(['blob:fake'])
  })

  it('rejects when the audio element emits an error event', async () => {
    const { revoked } = stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
    })

    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    const audio = audioInstances.at(-1)
    audio?.emit('error')

    await expect(promise).rejects.toThrow('tts audio playback failed')
    expect(audio?.paused).toBe(true)
    expect(revoked).toEqual(['blob:fake'])
  })

  it('resolves cancel when the audio element emits an error event after cancel', async () => {
    stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
    })

    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    const audio = audioInstances.at(-1)
    provider.cancel()
    audio?.emit('error')

    await expect(promise).resolves.toBe('cancel')
  })

  it('treats cancel after natural end or repeated cancel as a silent noop', async () => {
    const { revoked } = stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
    })

    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    const audio = audioInstances.at(-1)
    audio?.emit('ended')
    await expect(promise).resolves.toBe('done')
    expect(revoked).toEqual(['blob:fake'])

    expect(() => provider.cancel()).not.toThrow()
    expect(() => provider.cancel()).not.toThrow()
    expect(revoked).toEqual(['blob:fake'])
  })

  it('cancels the previous session when speaking again during pending fetch', async () => {
    stubBrowserGlobals()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, init?: { signal?: AbortSignal }) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new Error('aborted')),
            )
          }),
      ),
    )
    const provider = new ServerTtsProvider('kokoro')
    const voice = {
      providerId: 'kokoro',
      voiceId: '0',
      name: 'v',
      lang: 'en',
      isServerTts: true,
    } as const

    const first = provider.speak('slow paragraph', { voice, speed: 1 })
    const second = provider.speak('next speak while pending', {
      voice,
      speed: 1,
    })

    await expect(first).resolves.toBe('cancel')
    provider.cancel()
    await expect(second).resolves.toBe('cancel')
  })

  it('cancels the previous session when speaking again during playback', async () => {
    const { revoked } = stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')
    const voice = {
      providerId: 'kokoro',
      voiceId: '0',
      name: 'v',
      lang: 'en',
      isServerTts: true,
    } as const

    const first = provider.speak('hi', { voice, speed: 1 })
    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    const firstAudio = audioInstances.at(-1)

    const second = provider.speak('hi again', { voice, speed: 1 })
    await expect(first).resolves.toBe('cancel')
    expect(firstAudio?.paused).toBe(true)
    expect(revoked).toEqual(['blob:fake'])

    await vi.waitFor(() => expect(audioInstances.length).toBe(2))
    audioInstances.at(-1)?.emit('ended')
    await expect(second).resolves.toBe('done')
    expect(revoked).toEqual(['blob:fake', 'blob:fake'])
  })

  it('cancels the ongoing speak when the same signal aborts after a previous speak completed', async () => {
    stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')
    const voice = {
      providerId: 'kokoro',
      voiceId: '0',
      name: 'v',
      lang: 'en',
      isServerTts: true,
    } as const
    const controller = new AbortController()

    const first = provider.speak('first', {
      voice,
      speed: 1,
      signal: controller.signal,
    })
    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    audioInstances.at(-1)?.emit('ended')
    await expect(first).resolves.toBe('done')

    const second = provider.speak('second', {
      voice,
      speed: 1,
      signal: controller.signal,
    })
    await vi.waitFor(() => expect(audioInstances.length).toBe(2))

    controller.abort()

    await expect(second).resolves.toBe('cancel')
    expect(audioInstances.at(-1)?.paused).toBe(true)
  })

  it("does not cancel the next speak when a finished speak's signal aborts later", async () => {
    const { revoked } = stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')
    const voice = {
      providerId: 'kokoro',
      voiceId: '0',
      name: 'v',
      lang: 'en',
      isServerTts: true,
    } as const

    const firstController = new AbortController()
    const first = provider.speak('first', {
      voice,
      speed: 1,
      signal: firstController.signal,
    })
    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    audioInstances.at(-1)?.emit('ended')
    await expect(first).resolves.toBe('done')

    firstController.abort()

    const secondController = new AbortController()
    const second = provider.speak('second', {
      voice,
      speed: 1,
      signal: secondController.signal,
    })
    await vi.waitFor(() => expect(audioInstances.length).toBe(2))
    audioInstances.at(-1)?.emit('ended')
    await expect(second).resolves.toBe('done')
    expect(revoked).toEqual(['blob:fake', 'blob:fake'])
  })

  it('resolves done and revokes url when playback ends', async () => {
    const { revoked } = stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
    })

    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    const audio = audioInstances.at(-1)
    expect(audio?.played).toBe(true)

    audio?.emit('ended')
    await expect(promise).resolves.toBe('done')
    expect(revoked).toEqual(['blob:fake'])
  })

  it('resolves cancel when canceled during playback', async () => {
    const { revoked } = stubBrowserGlobals()
    stubFetchBlob(new Blob(['audio']))
    const provider = new ServerTtsProvider('kokoro')

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
    })

    await vi.waitFor(() => expect(audioInstances.length).toBe(1))
    const audio = audioInstances.at(-1)
    provider.cancel()
    await expect(promise).resolves.toBe('cancel')
    expect(audio?.paused).toBe(true)
    expect(revoked).toEqual(['blob:fake'])
  })

  it('resolves cancel when canceled during fetch', async () => {
    stubBrowserGlobals()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, init?: { signal?: AbortSignal }) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new Error('aborted')),
            )
          }),
      ),
    )
    const provider = new ServerTtsProvider('kokoro')

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
    })

    provider.cancel()
    await expect(promise).resolves.toBe('cancel')
  })

  it('resolves cancel when the options signal aborts during fetch', async () => {
    stubBrowserGlobals()
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_url, init?: { signal?: AbortSignal }) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new Error('aborted')),
            )
          }),
      ),
    )
    const provider = new ServerTtsProvider('kokoro')
    const controller = new AbortController()

    const promise = provider.speak('hi', {
      voice: {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v',
        lang: 'en',
        isServerTts: true,
      },
      speed: 1,
      signal: controller.signal,
    })

    controller.abort()
    await expect(promise).resolves.toBe('cancel')
  })

  it('rejects when the audio fetch fails', async () => {
    stubBrowserGlobals()
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('bad request', { status: 400 })),
    )
    const provider = new ServerTtsProvider('kokoro')

    await expect(
      provider.speak('hi', {
        voice: {
          providerId: 'kokoro',
          voiceId: '0',
          name: 'v',
          lang: 'en',
          isServerTts: true,
        },
        speed: 1,
      }),
    ).rejects.toThrow()
  })

  it('degrades to empty voices when voices fetch fails', async () => {
    stubBrowserGlobals()
    const fetchMock = vi.fn(async () => new Response('', { status: 500 }))
    vi.stubGlobal('fetch', fetchMock)
    const provider = new ServerTtsProvider('kokoro')

    await expect(provider.getVoices()).resolves.toEqual([])
  })

  it('resolves with the fetched voices list', async () => {
    stubBrowserGlobals()
    const voices = [
      {
        providerId: 'kokoro',
        voiceId: '0',
        name: 'v0',
        lang: 'en',
        isServerTts: true,
      },
    ]
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () => new Response(JSON.stringify({ voices }), { status: 200 }),
      ),
    )
    const provider = new ServerTtsProvider('kokoro')

    await expect(provider.getVoices()).resolves.toEqual(voices)
  })

  it('deduplicates concurrent getVoices calls into a single fetch', async () => {
    stubBrowserGlobals()
    const fetchMock = vi.fn(
      async () => new Response(JSON.stringify({ voices: [] }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)
    const provider = new ServerTtsProvider('kokoro')

    await Promise.all([provider.getVoices(), provider.getVoices()])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries the fetch after a failed load', async () => {
    stubBrowserGlobals()
    let status = 500
    const fetchMock = vi.fn(async () => new Response('', { status }))
    vi.stubGlobal('fetch', fetchMock)
    const provider = new ServerTtsProvider('kokoro')

    await expect(provider.getVoices()).resolves.toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)

    status = 200
    const reloadedVoices = [
      {
        providerId: 'kokoro',
        voiceId: '1',
        name: 'v1',
        lang: 'en',
        isServerTts: true,
      },
    ]
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ voices: reloadedVoices }), { status }),
    )
    await expect(provider.getVoices()).resolves.toEqual(reloadedVoices)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
