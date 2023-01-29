export function range(
  start: number,
  end: number,
  step = start < end ? 1 : -1
): number[] {
  const result = []
  if (step > 0)
    for (let i = start; i < end; i += step) {
      result.push(i)
    }
  else if (step < 0)
    for (let i = start; i > end; i += step) {
      result.push(i)
    }
  return result
}
export function compact<T>(
  list: (T | '' | 0 | false | null | undefined)[]
): T[] {
  return list.filter((it): it is T => !!it)
}

export function findPair<T>(
  list: T[],
  predicate: (value: T, index: number, list: T[]) => boolean,
  startIndex = 0
): [item: T, index: number] | [undefined, undefined] {
  let index = startIndex
  while (index < list.length) {
    const value = list[index]
    const testResult = predicate(value, index, list)
    if (testResult) {
      return [value, index]
    }
    index += 1
  }
  return [undefined, undefined]
}

export function findIndex<T>(
  list: T[],
  predicate: (value: T, index: number, list: T[]) => boolean,
  startIndex?: number
): number | undefined {
  return findPair(list, predicate, startIndex)[1]
}

export function find<T>(
  list: T[],
  predicate: (value: T, index: number, list: T[]) => boolean,
  startIndex?: number
): T | undefined {
  return findPair(list, predicate, startIndex)[0]
}

export function findLastPair<T>(
  list: T[],
  predicate: (value: T, index: number, list: T[]) => boolean,
  startIndex = list.length - 1
): [item: T, index: number] | [undefined, undefined] {
  let index = startIndex
  while (index >= 0) {
    const value = list[index]
    const testResult = predicate(value, index, list)
    if (testResult) {
      return [value, index]
    }
    index -= 1
  }
  return [undefined, undefined]
}

export function findLastIndex<T>(
  list: T[],
  predicate: (value: T, index: number, list: T[]) => boolean,
  startIndex?: number
): number | undefined {
  return findLastPair(list, predicate, startIndex)[1]
}

export function findLast<T>(
  list: T[],
  predicate: (value: T, index: number, list: T[]) => boolean,
  startIndex?: number
): T | undefined {
  return findLastPair(list, predicate, startIndex)[0]
}

export function maxIndexBy<T>(
  list: T[],
  getValue: (value: T, index: number, list: T[]) => number
): number {
  let maxValue: number | null = null
  let maxIndex: number | null = null
  for (const [index, it] of list.entries()) {
    const curValue = getValue(it, index, list)
    if (maxValue === null || curValue > maxValue) {
      maxValue = curValue
      maxIndex = index
    }
  }
  if (maxIndex === null) throw new Error('maxBy list is empty')
  return maxIndex
}

export function maxBy<T>(
  list: T[],
  getValue: (value: T, index: number, list: T[]) => number
): T {
  const index = maxIndexBy(list, getValue)
  return list[index]
}

export function minIndexBy<T>(
  list: T[],
  getValue: (value: T, index: number, list: T[]) => number
): number {
  let minValue: number | null = null
  let minIndex: number | null = null
  for (const [index, it] of list.entries()) {
    const curValue = getValue(it, index, list)
    if (minValue === null || curValue < minValue) {
      minValue = curValue
      minIndex = index
    }
  }
  if (minIndex === null) throw new Error('minBy list is empty')
  return minIndex
}

export function minBy<T>(
  list: T[],
  getValue: (value: T, index: number, list: T[]) => number
): T {
  const index = minIndexBy(list, getValue)
  return list[index]
}

export function uniqBy<T, V>(
  list: T[],
  getValue: (value: T, index: number, list: T[]) => V
): T[] {
  const map = new Map<V, T>()
  for (const [index, it] of list.entries()) {
    const v = getValue(it, index, list)
    if (!map.has(v)) map.set(v, it)
  }
  return [...map.values()]
}

export function uniq<T>(list: T[]): T[] {
  return uniqBy(list, (it) => it)
}

export function sortBy<T>(
  list: T[],
  getValue: (value: T, index: number, list: T[]) => unknown
): T[] {
  const listEntries = [...list.entries()]
  listEntries.sort(([ai, a], [bi, b]) => {
    const va = getValue(a, ai, list)
    const vb = getValue(b, bi, list)
    if (typeof va === 'string' && typeof vb === 'string')
      return va.localeCompare(vb)
    else if (typeof va === 'number' && typeof vb === 'number') return va - vb
    else if (typeof va === 'boolean' && typeof vb === 'boolean')
      return Number(va) - Number(vb)
    return 0
  })
  return listEntries.map((it) => it[1])
}

export function groupToMap<T, A>(
  list: T[],
  getKey: (item: T, index: number, list: T[]) => A
): Map<A, T[]> {
  const map = new Map<A, T[]>()
  for (const [index, item] of list.entries()) {
    const key = getKey(item, index, list)
    let group = map.get(key)
    if (!group) {
      group = []
      map.set(key, group)
    }
    group.push(item)
  }
  return map
}
