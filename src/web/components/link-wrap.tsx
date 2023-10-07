import { useHref } from 'react-router-dom'

export type LinkWrapProps = {
  to: string
  children: (href: string) => JSX.Element
}

export function LinkWrap({ to, children }: LinkWrapProps) {
  const href = useHref(to)
  return children(href)
}
