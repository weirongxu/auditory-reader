import { FileUpload, Photo } from '@mui/icons-material'
import { Stack, Typography } from '@mui/material'
import type { DropzoneProps } from 'react-dropzone'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import styles from './dropzone.module.scss'

export const Dropzone = (props: DropzoneProps & { prompt?: string }) => {
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone(props)
  const { t } = useTranslation()
  return (
    <div {...getRootProps({ className: styles.dropzone })}>
      <input {...getInputProps()} />
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
          {isDragActive ? (
            <Stack direction="row" spacing={2}>
              <FileUpload></FileUpload>
              <div>Drop file here</div>
              <div>{t('prompt.dropzone')}</div>
            </Stack>
          ) : (
            <Stack direction="row" spacing={2}>
              <Photo></Photo>
              <div>{t('prompt.dropzone')}</div>
            </Stack>
          )}
          {props.prompt && (
            <Typography sx={{ textAlign: 'center' }}>{props.prompt}</Typography>
          )}
        </Stack>
      )}
    </div>
  )
}
