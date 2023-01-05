import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { langEn } from './langs/en.js'
import { langZh } from './langs/zh.js'

const resources = {
  en: {
    translation: langEn,
  },
  zh: {
    translation: langZh,
  },
}

declare module 'i18next' {
  interface CustomTypeOptions {
    resources: typeof resources['en']
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: global.navigator?.languages?.at(0) ?? 'en',
  })
  .catch(console.error)
