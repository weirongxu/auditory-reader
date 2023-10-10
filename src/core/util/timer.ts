import { range } from './collection.js'
import { sleep } from './promise.js'

export function debounceFn<A extends Array<any>>(
  delay: number,
  fn: (...args: A) => void,
): (...args: A) => void {
  let timer: NodeJS.Timeout | undefined
  return (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function throttleFn<A extends Array<any>, R>(
  delay: number,
  fn: (...args: A) => R,
): (...args: A) => R | void {
  let isThrottled = false
  return (...args: A) => {
    if (!isThrottled) {
      const result = fn(...args)
      isThrottled = true
      setTimeout(() => (isThrottled = false), delay)
      return result
    }
  }
}

export function throttleTailFn<A extends Array<any>, R>(
  delay: number,
  fn: (...args: A) => R,
): (...args: A) => R | void {
  let timer: NodeJS.Timeout | undefined
  let isThrottled = false
  return (...args: A) => {
    clearTimeout(timer)
    if (isThrottled) {
      timer = setTimeout(() => fn(...args), delay)
    } else {
      const result = fn(...args)
      isThrottled = true
      setTimeout(() => (isThrottled = false), delay)
      return result
    }
  }
}

export interface IterateAnimateOptions {
  iteration?: number
  duration?: number
  abortCtrl?: AbortController
}

export async function iterateAnimate(
  { iteration = 10, duration = 100, abortCtrl }: IterateAnimateOptions,
  callback: (index: number) => unknown,
) {
  let aborted = false
  abortCtrl?.signal.addEventListener('abort', () => {
    aborted = true
  })

  const unitTime = duration / iteration
  for (const i of range(0, iteration + 1)) {
    await sleep(unitTime)
    if (aborted) break
    await callback(i)
  }
}
