import isMobileJS from 'ismobilejs'

export const isBrowser: boolean = typeof self !== 'undefined'

export const supportedTouch: boolean =
  'ontouchstart' in
  (isBrowser ? ((globalThis.window as Window | undefined) ?? {}) : {})

export const isMobile: boolean =
  isBrowser && isMobileJS(navigator.userAgent).any

export const isSafari: boolean =
  isBrowser && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const isFirefox: boolean =
  isBrowser && navigator.userAgent.toLowerCase().includes('firefox')
