import { orderBy, range } from '../util/collection.js'
import type { TextAlias } from '../util/readable.js'

export type AliasResult = {
  text: string
  highlightOffsets: [index: number, accOffset: number][]
}

export function aliasReplace(
  text: string,
  aliasArray: TextAlias[],
): AliasResult {
  if (!aliasArray.length) {
    return {
      text,
      highlightOffsets: [],
    }
  }

  const highlightOffsets: [index: number, accOffset: number][] = []
  const indexMap = new Map<number, TextAlias>()
  for (const alias of aliasArray) {
    let i = text.indexOf(alias.source)
    while (i !== -1) {
      if (!indexMap.has(i)) {
        indexMap.set(i, alias)
      }
      i = text.indexOf(alias.source, i + 1)
    }
  }
  const orderedIndexes = orderBy([...indexMap.entries()], 'asc', ([i]) => i)
  let accOffset = 0
  for (const [i, { source, target }] of orderedIndexes) {
    text = text.replace(source, target)
    const unitOffset = source.length - target.length
    if (unitOffset === 0) continue
    const afterI = i - accOffset
    highlightOffsets.push([afterI, accOffset])
    for (const j of range(1, target.length)) {
      highlightOffsets.push([
        afterI + j,
        accOffset + Math.floor(unitOffset * (j / target.length)),
      ])
    }
    accOffset = accOffset + unitOffset
  }
  return { text, highlightOffsets }
}
