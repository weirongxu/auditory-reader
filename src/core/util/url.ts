export function urlSplitHash(url: string) {
  const [mainUrl, anchorId] = url.split('#', 2)
  return [mainUrl, decodeURIComponent(anchorId)]
}

export function isUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}
