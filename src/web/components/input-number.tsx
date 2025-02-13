import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, InputNumber, Space, type InputNumberProps } from 'antd'
import { isMobile } from '../../core/util/browser.js'

function normalizeValue(value: number): number {
  return parseFloat(value.toFixed(10))
}

export function RInputNumber(props: InputNumberProps<number>) {
  if (isMobile) {
    let step = 1
    if (props.step !== undefined)
      if (typeof props.step === 'number') step = props.step
      else if (typeof props.step === 'string') step = parseFloat(props.step)
    return (
      <Space.Compact>
        <Button
          size={props.size}
          onClick={() => {
            const value = (props.value ?? 0) - step
            props.onChange?.(normalizeValue(value))
          }}
        >
          <FontAwesomeIcon icon={faArrowDown} />
        </Button>
        <InputNumber<number> {...props}></InputNumber>
        <Button
          size={props.size}
          onClick={() => {
            const value = (props.value ?? 0) + step
            props.onChange?.(normalizeValue(value))
          }}
        >
          <FontAwesomeIcon icon={faArrowUp} />
        </Button>
      </Space.Compact>
    )
  }
  return <InputNumber<number> {...props}></InputNumber>
}
