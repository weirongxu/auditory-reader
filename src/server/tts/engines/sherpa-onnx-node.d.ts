declare module 'sherpa-onnx-node' {
  export interface OfflineTtsConfig {
    model: Record<string, unknown>
    ruleFsts?: string
    ruleCats?: string
    maxNumSentences?: number
    silenceScale?: number
  }

  export interface GeneratedAudio {
    samples: Float32Array
    sampleRate: number
  }

  export interface WaveObject {
    samples: Float32Array
    sampleRate: number
  }

  export interface OfflineTtsInstance {
    sampleRate: number
    numSpeakers: number
    generate(options: {
      text: string
      sid?: number
      speed?: number
    }): GeneratedAudio
    generateAsync(options: {
      text: string
      sid?: number
      speed?: number
      onProgress?: (info: { progress: number }) => number | boolean
    }): Promise<GeneratedAudio>
  }

  const sherpa: {
    OfflineTts: {
      createAsync(config: OfflineTtsConfig): Promise<OfflineTtsInstance>
    }
    writeWave(filename: string, wave: WaveObject): void
    readWave(filename: string): WaveObject
  }
  export default sherpa
}
