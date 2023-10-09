export interface ListViewProps extends React.HTMLAttributes<HTMLDivElement> {
  dir?: 'row' | 'column'
  gap?: number | string
  flex?: number
  children?: React.ReactNode
}

export function FlexBox({
  dir = 'column',
  gap = 0,
  flex,
  style,
  children,
  ...props
}: ListViewProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: dir,
        gap,
        flex,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
