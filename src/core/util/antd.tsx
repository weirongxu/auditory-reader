import type React from 'react'

export const filterOptionLabel = <T,>(
  search: string,
  option:
    | {
        label: React.ReactNode
        value: T
      }
    | {
        label: React.ReactNode
        value: undefined
      }
    | undefined,
) => {
  if (!option) return false
  if (typeof option.label !== 'string') return false
  return option.label.toLowerCase().includes(search.toLowerCase())
}
