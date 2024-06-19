import { Select } from 'antd'
import { t } from 'i18next'
import { useOrderedLangOptions } from '../../core/lang.js'

export type LanguageSelectProps = {
  value?: string
  onChange?: (value: string) => void
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const langOptions = useOrderedLangOptions()
  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder={t('prompt.selectLanguage')}
      filterOption={(input, option) =>
        option?.label.toLowerCase().includes(input.toLowerCase()) ?? false
      }
      showSearch
      options={langOptions}
    ></Select>
  )
}
