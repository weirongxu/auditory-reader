import isMobileJS from 'ismobilejs'

export const isBrowser: boolean =
  Boolean(global.window) || Boolean(global.navigator)

export const supportedTouch: boolean =
  'ontouchstart' in (isBrowser ? global.window : {})

export const isMobile: boolean =
  isBrowser && isMobileJS(navigator.userAgent).any

export const isSafari: boolean =
  isBrowser && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const isFirefox: boolean =
  isBrowser && navigator.userAgent.toLowerCase().includes('firefox')
