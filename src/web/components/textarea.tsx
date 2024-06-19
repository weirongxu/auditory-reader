import { Input } from 'antd'
import type { TextAreaProps } from 'antd/es/input/TextArea.js'
import { eventBan } from '../../core/util/dom.js'

export function Textarea({ ...props }: TextAreaProps) {
  return (
    <Input.TextArea
      rows={4}
      onKeyDown={(e) => {
        if (e.ctrlKey && e.key === 'Enter') {
          const elem = e.target as HTMLTextAreaElement
          eventBan(e)
          elem.closest('form')?.dispatchEvent(
            new Event('submit', {
              bubbles: true,
              cancelable: true,
            }),
          )
        }
      }}
      {...props}
    ></Input.TextArea>
  )
}
