import { useHref } from 'react-router-dom'

export type LinkWrapProps = {
  to: string
  children: (href: string) => JSX.Element
}

export function LinkWrap(props: LinkWrapProps) {
  const href = useHref(props.to)
  return props.children(href)
}
