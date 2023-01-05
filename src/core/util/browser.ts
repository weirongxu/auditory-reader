export const isBrowser = !!global.window || !!global.navigator

export const supportTouch = 'ontouchstart' in (global.window ?? {})
