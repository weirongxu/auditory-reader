import { Alert } from '@mui/material'

export function NotFound({ title }: { title: string }) {
  return (
    <Alert title={`The ${title} not found`} severity="error">
      The {title} not found
    </Alert>
  )
}
