declare module '*.module.scss' {
  const styles: Record<string, string>
  export default styles
}

declare module '*.scss' {
  const path: string
  export default path
}

declare module '*.mp3' {
  const url: string
  export default url
}
