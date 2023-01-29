export function debounceFn<A extends Array<any>>(
  delay: number,
  fn: (...args: A) => void
): (...args: A) => void {
  let timer: NodeJS.Timeout | undefined
  return (...args: A) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

export function throttleFn<A extends Array<any>, R>(
  delay: number,
  fn: (...args: A) => R
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
