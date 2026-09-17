import path from '@file-services/path'
import fs from 'fs'

const TTS_MODELS_PATH = 'server-data/tts-models'

export type SherpaProviderId = 'kokoro' | 'matcha' | 'melo'

export const MODEL_DIR_NAMES: Record<SherpaProviderId, string> = {
  kokoro: 'kokoro-int8-multi-lang-v1_1',
  matcha: 'matcha-icefall-zh-baker',
  melo: 'vits-melo-tts-zh_en',
}

export const VOCODER_FILE_NAME = 'hifigan_v2.onnx'

export function modelDirPath(providerId: SherpaProviderId): string {
  return path.join(TTS_MODELS_PATH, MODEL_DIR_NAMES[providerId])
}

export function vocoderFilePath(): string {
  return path.join(TTS_MODELS_PATH, VOCODER_FILE_NAME)
}

export function sherpaModelFilesExist(providerId: SherpaProviderId): boolean {
  if (!fs.existsSync(modelDirPath(providerId))) return false
  switch (providerId) {
    case 'kokoro':
      return [
        'model.int8.onnx',
        'voices.bin',
        'tokens.txt',
        'espeak-ng-data',
      ].every((name) => fs.existsSync(path.join(modelDirPath('kokoro'), name)))
    case 'matcha':
      return (
        fs.existsSync(vocoderFilePath()) &&
        ['model-steps-3.onnx', 'lexicon.txt', 'tokens.txt'].every((name) =>
          fs.existsSync(path.join(modelDirPath('matcha'), name)),
        )
      )
    case 'melo':
      return ['model.onnx', 'lexicon.txt', 'tokens.txt', 'dict'].every((name) =>
        fs.existsSync(path.join(modelDirPath('melo'), name)),
      )
  }
}

export type SherpaModelConfig = {
  model: {
    kokoro?: {
      model: string
      voices: string
      tokens: string
      dataDir: string
      lexicon: string
    }
    matcha?: {
      acousticModel: string
      vocoder: string
      lexicon: string
      tokens: string
      dictDir?: string
    }
    vits?: {
      model: string
      lexicon: string
      tokens: string
      dictDir: string
    }
  }
  ruleFsts?: string
  maxNumSentences: number
  numThreads: number
  provider: string
}

export function buildSherpaModelConfig(
  providerId: SherpaProviderId,
): SherpaModelConfig {
  switch (providerId) {
    case 'kokoro': {
      const dir = modelDirPath('kokoro')
      return {
        model: {
          kokoro: {
            model: path.join(dir, 'model.int8.onnx'),
            voices: path.join(dir, 'voices.bin'),
            tokens: path.join(dir, 'tokens.txt'),
            dataDir: path.join(dir, 'espeak-ng-data'),
            lexicon: `${path.join(dir, 'lexicon-us-en.txt')},${path.join(
              dir,
              'lexicon-zh.txt',
            )}`,
          },
        },
        maxNumSentences: 1,
        numThreads: 2,
        provider: 'cpu',
      }
    }
    case 'matcha': {
      const dir = modelDirPath('matcha')
      return {
        model: {
          matcha: {
            acousticModel: path.join(dir, 'model-steps-3.onnx'),
            vocoder: vocoderFilePath(),
            lexicon: path.join(dir, 'lexicon.txt'),
            tokens: path.join(dir, 'tokens.txt'),
            dictDir: path.join(dir, 'dict'),
          },
        },
        ruleFsts: [
          path.join(dir, 'date.fst'),
          path.join(dir, 'number.fst'),
        ].join(','),
        maxNumSentences: 1,
        numThreads: 2,
        provider: 'cpu',
      }
    }
    case 'melo': {
      const dir = modelDirPath('melo')
      return {
        model: {
          vits: {
            model: path.join(dir, 'model.onnx'),
            lexicon: path.join(dir, 'lexicon.txt'),
            tokens: path.join(dir, 'tokens.txt'),
            dictDir: path.join(dir, 'dict'),
          },
        },
        maxNumSentences: 1,
        numThreads: 2,
        provider: 'cpu',
      }
    }
  }
}
