import { useMemo } from 'react'
import { orderBy } from './util/collection.js'

const langSet = [
  { code: 'ab', name: 'Abkhazian' },
  { code: 'aa', name: 'Afar' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'ak', name: 'Akan' },
  { code: 'sq', name: 'Albanian' },
  { code: 'am', name: 'Amharic' },
  { code: 'ar', name: 'Arabic' },
  { code: 'an', name: 'Aragonese' },
  { code: 'hy', name: 'Armenian' },
  { code: 'as', name: 'Assamese' },
  { code: 'av', name: 'Avaric' },
  { code: 'ae', name: 'Avestan' },
  { code: 'ay', name: 'Aymara' },
  { code: 'az', name: 'Azerbaijani' },
  { code: 'bm', name: 'Bambara' },
  { code: 'ba', name: 'Bashkir' },
  { code: 'eu', name: 'Basque' },
  { code: 'be', name: 'Belarusian' },
  { code: 'bn', name: 'Bengali (Bangla)' },
  { code: 'bh', name: 'Bihari' },
  { code: 'bi', name: 'Bislama' },
  { code: 'bs', name: 'Bosnian' },
  { code: 'br', name: 'Breton' },
  { code: 'bg', name: 'Bulgarian' },
  { code: 'my', name: 'Burmese' },
  { code: 'ca', name: 'Catalan' },
  { code: 'ch', name: 'Chamorro' },
  { code: 'ce', name: 'Chechen' },
  { code: 'ny', name: 'Chichewa, Chewa, Nyanja' },
  { code: 'zh', name: 'Chinese' },
  // { code: 'zh-Hans', name: 'Chinese (Simplified)' },
  // { code: 'zh-Hant', name: 'Chinese (Traditional)' },
  { code: 'cv', name: 'Chuvash' },
  { code: 'kw', name: 'Cornish' },
  { code: 'co', name: 'Corsican' },
  { code: 'cr', name: 'Cree' },
  { code: 'hr', name: 'Croatian' },
  { code: 'cs', name: 'Czech' },
  { code: 'da', name: 'Danish' },
  { code: 'dv', name: 'Divehi, Dhivehi, Maldivian' },
  { code: 'nl', name: 'Dutch' },
  { code: 'dz', name: 'Dzongkha' },
  { code: 'en', name: 'English' },
  { code: 'eo', name: 'Esperanto' },
  { code: 'et', name: 'Estonian' },
  { code: 'ee', name: 'Ewe' },
  { code: 'fo', name: 'Faroese' },
  { code: 'fj', name: 'Fijian' },
  { code: 'fi', name: 'Finnish' },
  { code: 'fr', name: 'French' },
  { code: 'ff', name: 'Fula, Fulah, Pulaar, Pular' },
  { code: 'gl', name: 'Galician' },
  { code: 'gd', name: 'Gaelic (Scottish)' },
  { code: 'gv', name: 'Gaelic (Manx)' },
  { code: 'ka', name: 'Georgian' },
  { code: 'de', name: 'German' },
  { code: 'el', name: 'Greek' },
  { code: 'kl', name: 'Greenlandic' },
  { code: 'gn', name: 'Guarani' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'ht', name: 'Haitian Creole' },
  { code: 'ha', name: 'Hausa' },
  { code: 'he', name: 'Hebrew' },
  { code: 'hz', name: 'Herero' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ho', name: 'Hiri Motu' },
  { code: 'hu', name: 'Hungarian' },
  { code: 'is', name: 'Icelandic' },
  { code: 'io', name: 'Ido' },
  { code: 'ig', name: 'Igbo' },
  { code: 'id, in', name: 'Indonesian' },
  { code: 'ia', name: 'Interlingua' },
  { code: 'ie', name: 'Interlingue' },
  { code: 'iu', name: 'Inuktitut' },
  { code: 'ik', name: 'Inupiak' },
  { code: 'ga', name: 'Irish' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'jv', name: 'Javanese' },
  { code: 'kl', name: 'Kalaallisut, Greenlandic' },
  { code: 'kn', name: 'Kannada' },
  { code: 'kr', name: 'Kanuri' },
  { code: 'ks', name: 'Kashmiri' },
  { code: 'kk', name: 'Kazakh' },
  { code: 'km', name: 'Khmer' },
  { code: 'ki', name: 'Kikuyu' },
  { code: 'rw', name: 'Kinyarwanda (Rwanda)' },
  { code: 'rn', name: 'Kirundi' },
  { code: 'ky', name: 'Kyrgyz' },
  { code: 'kv', name: 'Komi' },
  { code: 'kg', name: 'Kongo' },
  { code: 'ko', name: 'Korean' },
  { code: 'ku', name: 'Kurdish' },
  { code: 'kj', name: 'Kwanyama' },
  { code: 'lo', name: 'Lao' },
  { code: 'la', name: 'Latin' },
  { code: 'lv', name: 'Latvian (Lettish)' },
  { code: 'li', name: 'Limburgish ( Limburger)' },
  { code: 'ln', name: 'Lingala' },
  { code: 'lt', name: 'Lithuanian' },
  { code: 'lu', name: 'Luga-Katanga' },
  { code: 'lg', name: 'Luganda, Ganda' },
  { code: 'lb', name: 'Luxembourgish' },
  { code: 'gv', name: 'Manx' },
  { code: 'mk', name: 'Macedonian' },
  { code: 'mg', name: 'Malagasy' },
  { code: 'ms', name: 'Malay' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'mt', name: 'Maltese' },
  { code: 'mi', name: 'Maori' },
  { code: 'mr', name: 'Marathi' },
  { code: 'mh', name: 'Marshallese' },
  { code: 'mo', name: 'Moldavian' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'na', name: 'Nauru' },
  { code: 'nv', name: 'Navajo' },
  { code: 'ng', name: 'Ndonga' },
  { code: 'nd', name: 'Northern Ndebele' },
  { code: 'ne', name: 'Nepali' },
  { code: 'no', name: 'Norwegian' },
  { code: 'nb', name: 'Norwegian bokmål' },
  { code: 'nn', name: 'Norwegian nynorsk' },
  { code: 'ii', name: 'Nuosu' },
  { code: 'oc', name: 'Occitan' },
  { code: 'oj', name: 'Ojibwe' },
  { code: 'cu', name: 'Old Church Slavonic, Old Bulgarian' },
  { code: 'or', name: 'Oriya' },
  { code: 'om', name: 'Oromo (Afaan Oromo)' },
  { code: 'os', name: 'Ossetian' },
  { code: 'pi', name: 'Pāli' },
  { code: 'ps', name: 'Pashto, Pushto' },
  { code: 'fa', name: 'Persian (Farsi)' },
  { code: 'pl', name: 'Polish' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'pa', name: 'Punjabi (Eastern)' },
  { code: 'qu', name: 'Quechua' },
  { code: 'rm', name: 'Romansh' },
  { code: 'ro', name: 'Romanian' },
  { code: 'ru', name: 'Russian' },
  { code: 'se', name: 'Sami' },
  { code: 'sm', name: 'Samoan' },
  { code: 'sg', name: 'Sango' },
  { code: 'sa', name: 'Sanskrit' },
  { code: 'sr', name: 'Serbian' },
  { code: 'sh', name: 'Serbo-Croatian' },
  { code: 'st', name: 'Sesotho' },
  { code: 'tn', name: 'Setswana' },
  { code: 'sn', name: 'Shona' },
  { code: 'ii', name: 'Sichuan Yi' },
  { code: 'sd', name: 'Sindhi' },
  { code: 'si', name: 'Sinhalese' },
  { code: 'ss', name: 'Siswati' },
  { code: 'sk', name: 'Slovak' },
  { code: 'sl', name: 'Slovenian' },
  { code: 'so', name: 'Somali' },
  { code: 'nr', name: 'Southern Ndebele' },
  { code: 'es', name: 'Spanish' },
  { code: 'su', name: 'Sundanese' },
  { code: 'sw', name: 'Swahili (Kiswahili)' },
  { code: 'ss', name: 'Swati' },
  { code: 'sv', name: 'Swedish' },
  { code: 'tl', name: 'Tagalog' },
  { code: 'ty', name: 'Tahitian' },
  { code: 'tg', name: 'Tajik' },
  { code: 'ta', name: 'Tamil' },
  { code: 'tt', name: 'Tatar' },
  { code: 'te', name: 'Telugu' },
  { code: 'th', name: 'Thai' },
  { code: 'bo', name: 'Tibetan' },
  { code: 'ti', name: 'Tigrinya' },
  { code: 'to', name: 'Tonga' },
  { code: 'ts', name: 'Tsonga' },
  { code: 'tr', name: 'Turkish' },
  { code: 'tk', name: 'Turkmen' },
  { code: 'tw', name: 'Twi' },
  { code: 'ug', name: 'Uyghur' },
  { code: 'uk', name: 'Ukrainian' },
  { code: 'ur', name: 'Urdu' },
  { code: 'uz', name: 'Uzbek' },
  { code: 've', name: 'Venda' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'vo', name: 'Volapük' },
  { code: 'wa', name: 'Wallon' },
  { code: 'cy', name: 'Welsh' },
  { code: 'wo', name: 'Wolof' },
  { code: 'fy', name: 'Western Frisian' },
  { code: 'xh', name: 'Xhosa' },
  { code: 'yi, ji', name: 'Yiddish' },
  { code: 'yo', name: 'Yoruba' },
  { code: 'za', name: 'Zhuang, Chuang' },
  { code: 'zu', name: 'Zulu' },
] as const

type LangItem = (typeof langSet)[number]
export type LangCode = (typeof langSet)[number]['code']

export const langList = langSet as unknown as LangItem[]

export const langCodes: LangCode[] = langSet.map((l) => l.code)

export const parseLangCode = (
  lang: string | null | undefined
): LangCode | undefined => {
  if (!lang) return
  if (lang.includes('-')) lang = lang.split('-')[0]
  if (!langCodes.includes(lang as LangCode)) {
    return
  }
  return lang as LangCode
}

export const useUserLanguages = (): LangCode[] => {
  const userLanguages = useMemo(
    () => (global.navigator?.languages ?? []) as LangCode[],
    []
  )
  return userLanguages
}

export const useOrderedLangs = () => {
  const userLanguages = useUserLanguages()

  const langs = useMemo(() => {
    return orderBy(langList, 'asc', (l) =>
      userLanguages.indexOf(l.code) === -1 ? 0 : 1
    )
  }, [userLanguages])

  return langs
}

export const useOrderedLangOptions = () => {
  const langs = useOrderedLangs()

  const options = useMemo(() => {
    return langs.map((l: { name: string; code: LangCode }) => ({
      value: l.code,
      label: `${l.name} (${l.code})`,
    }))
  }, [langs])

  return options
}
