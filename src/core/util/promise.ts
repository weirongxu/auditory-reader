export const async = (fn: () => Promise<unknown>) => {
  fn().catch(console.error)
}

export const sleep = (ms: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}
