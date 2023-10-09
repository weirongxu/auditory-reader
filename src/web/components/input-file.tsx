import { FileUpload } from '@mui/icons-material'
import { Typography } from '@mui/material'
import { useState } from 'react'
import { FlexBox } from './flex-box.js'
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
        <FlexBox gap={2}>
          {acceptedFiles.map((file, i) => {
            return (
              <FlexBox key={i} dir="row" gap={2}>
                <FileUpload></FileUpload>
                <div>{file.name}</div>
              </FlexBox>
            )
          })}
        </FlexBox>
      ) : (
        <FlexBox gap={2} style={{ justifyContent: 'center' }}>
          {prompt && (
            <Typography sx={{ textAlign: 'center' }}>{prompt}</Typography>
          )}
        </FlexBox>
      )}
    </label>
  )
}
