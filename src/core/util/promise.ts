export const async = (fn: () => Promise<unknown>) => {
  fn().catch(console.error)
}

export const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}

export const nextTick = () => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve
    })
  })
}
