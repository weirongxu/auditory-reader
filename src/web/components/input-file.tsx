import { FileUpload } from '@mui/icons-material'
import { Stack, Typography } from '@mui/material'
import { useState } from 'react'
import styles from './input-file.module.scss'

export const InputFile = ({
  accept,
  prompt,
  onChange,
}: {
  accept?: string
  prompt?: string
  onChange?: (files: File[]) => void
}) => {
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([])
  return (
    <label className={styles.inputFile}>
      <input
        hidden
        accept={accept}
        multiple
        type="file"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])]
          setAcceptedFiles(files)
          onChange?.(files)
        }}
      />
      {acceptedFiles.length ? (
        <Stack direction="column" spacing={2}>
          {acceptedFiles.map((file, i) => {
            return (
              <Stack key={i} direction="row" spacing={2}>
                <FileUpload></FileUpload>
                <div>{file.name}</div>
              </Stack>
            )
          })}
        </Stack>
      ) : (
        <Stack spacing={2} justifyContent="center">
          {prompt && (
            <Typography sx={{ textAlign: 'center' }}>{prompt}</Typography>
          )}
        </Stack>
      )}
    </label>
  )
}
