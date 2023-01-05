export function urlSplitHash(url: string) {
  const [mainUrl, anchorId] = url.split('#', 2)
  return [mainUrl, decodeURIComponent(anchorId)]
}
