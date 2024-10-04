import { faUpload } from '@fortawesome/free-solid-svg-icons'
import { Typography } from 'antd'
import { useEffect, useState } from 'react'
import { FlexBox } from './flex-box.js'
import { Icon } from './icon.js'
import styles from './file-input.module.scss'

export const FileInput = ({
  accept,
  prompt,
  value,
  onChange,
}: {
  accept?: string
  prompt?: string
  value?: File
  onChange?: (files?: File) => void
}) => {
  const [acceptedFile, setAcceptedFile] = useState<File>()
  useEffect(() => {
    setAcceptedFile(value)
  }, [value])

  return (
    <label className={styles.fileInput}>
      <input
        style={{ display: 'none' }}
        accept={accept}
        type="file"
        onChange={(event) => {
          const files = [...(event.target.files ?? [])]
          setAcceptedFile(files[0])
          onChange?.(files[0])
        }}
      />
      {acceptedFile ? (
        <FlexBox gap={5}>
          <FlexBox dir="row" gap={5} style={{ alignItems: 'center' }}>
            <Icon icon={faUpload} />
            <div>{acceptedFile.name}</div>
          </FlexBox>
        </FlexBox>
      ) : (
        <FlexBox gap={2} style={{ justifyContent: 'center' }}>
          {prompt && <Typography>{prompt}</Typography>}
        </FlexBox>
      )}
    </label>
  )
}
