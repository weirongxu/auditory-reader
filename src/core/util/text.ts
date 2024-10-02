import { find } from './collection.js'

export function splitLines(text: string) {
  return text.split(/\r?\n/)
}

export function splitParagraph(text: string) {
  return text.split(/\r?\n\r?\n/)
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function textEllipsis(text: string | undefined, maxLength: number) {
  if (!text) return ''
  if (text.length > maxLength + 3) {
    return `${text.slice(0, maxLength)}...`
  }
  return text
}

export function keywordMatches(
  text: string,
  keyword: { keyword: string; alias?: string[] },
) {
  function matchAllIndex(text: string, search: string) {
    const matchIndexes: number[] = []
    let index = 0
    const len = text.length
    while (index < len) {
      const m = text.indexOf(search, index)
      if (m === -1) break
      matchIndexes.push(m)
      index = m + search.length
    }
    return matchIndexes
  }

  const keywordMatches: [index: number, length: number][] = matchAllIndex(
    text,
    keyword.keyword,
  ).map((index) => [index, keyword.keyword.length])
  const aliasMatches: [index: number, length: number][] = []
  if (keyword.alias)
    for (const alias of keyword.alias) {
      const len = alias.length
      const matches = matchAllIndex(text, alias).filter(
        (m) => !keywordMatches.some((k) => k[0] <= m && k[0] + k[1] >= m + len),
      )
      aliasMatches.push(
        ...matches.map((m) => [m, len] satisfies [number, number]),
      )
    }
  return [...keywordMatches, ...aliasMatches]
}
