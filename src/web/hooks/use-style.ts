import { useMountEffect } from '@react-hookz/web'

export function useStyle(styleCSS: string) {
  useMountEffect(() => {
    const style = document.createElement('style')
    style.innerHTML = styleCSS
    const title = document.head.querySelector('title')
    if (title && title.nextSibling)
      document.head.insertBefore(style, title.nextSibling)
    else document.head.prepend(style)
  })
}
