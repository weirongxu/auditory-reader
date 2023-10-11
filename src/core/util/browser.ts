export const isBrowser = !!global.window || !!global.navigator

export const supportedTouch = 'ontouchstart' in (global.window ?? {})

export const isMobile = supportedTouch

export const isSafari =
  isBrowser && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const isFirefox =
  isBrowser && navigator.userAgent.toLowerCase().includes('firefox')
