declare global {
  interface NavigatorUAData {
    readonly mobile: boolean
  }
  interface Navigator {
    readonly userAgentData?: NavigatorUAData
  }
}

export const isBrowser: boolean = typeof self !== 'undefined'

export const supportedTouch: boolean =
  'ontouchstart' in
  (isBrowser ? ((globalThis.window as Window | undefined) ?? {}) : {})

export const isMobile: boolean = isBrowser && detectMobile()

function detectMobile(): boolean {
  const { userAgentData } = navigator
  if (userAgentData) return userAgentData.mobile
  const { userAgent, maxTouchPoints } = navigator
  if (
    /Android|iPhone|iPod|IEMobile|Opera Mini|BlackBerry|Mobi/i.test(userAgent)
  )
    return true
  // iPadOS 13+ reports a Macintosh UA but is a touch device
  return userAgent.includes('Macintosh') && maxTouchPoints > 1
}

export const isSafari: boolean =
  isBrowser && /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const isFirefox: boolean =
  isBrowser && navigator.userAgent.toLowerCase().includes('firefox')
