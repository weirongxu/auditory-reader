import { TextField, type TextFieldProps } from '@mui/material'
import { eventBan } from '../../core/util/dom.js'

export function Textarea({ ...props }: TextFieldProps) {
  return (
    <TextField
      minRows={4}
      multiline
      variant="outlined"
      InputProps={{
        onKeyDown: (e) => {
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
        },
        ...props.InputProps,
      }}
      {...props}
    ></TextField>
  )
}
