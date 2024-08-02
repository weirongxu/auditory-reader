import { Select } from 'antd'
import { t } from 'i18next'
import { useOrderedLangOptions } from '../../core/lang.js'
import { filterOptionLabel } from '../../core/util/antd.js'

export type LanguageSelectProps = {
  value?: string
  onChange?: (value: string) => void
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const langOptions = useOrderedLangOptions()
  return (
    <Select
      showSearch
      filterOption={filterOptionLabel}
      popupMatchSelectWidth={false}
      value={value}
      onChange={onChange}
      placeholder={t('prompt.selectLanguage')}
      options={langOptions}
    ></Select>
  )
}
