import type { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export type IconProps = {
  icon: IconProp
  color?: string
  size?: SizeProp
  style?: React.CSSProperties
  onClick?: React.MouseEventHandler
}

export function Icon({ icon, size, style, onClick, color }: IconProps) {
  return (
    <FontAwesomeIcon
      icon={icon}
      size={size ?? 'lg'}
      color={color}
      style={{
        paddingLeft: '6px',
        paddingRight: '6px',
        ...style,
      }}
      onClick={onClick}
    ></FontAwesomeIcon>
  )
}
