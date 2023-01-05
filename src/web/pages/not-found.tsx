import { Alert } from '@mui/material'

export function NotFound(props: { title: string }) {
  const { title } = props
  return (
    <Alert title={`The ${title} not found`} severity="error">
      The {title} not found
    </Alert>
  )
}
