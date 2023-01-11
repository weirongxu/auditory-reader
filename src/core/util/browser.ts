export const isBrowser = !!global.window || !!global.navigator

export const supportedTouch = 'ontouchstart' in (global.window ?? {})

export const isMobile = supportedTouch
