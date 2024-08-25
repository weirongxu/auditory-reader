import { Select } from 'antd'
import { t } from 'i18next'
import { useOrderedLangOptions } from '../../core/lang.js'
import { filterOptionLabel } from '../../core/util/antd.js'
import { useMemo, useState } from 'react'

export type LanguageSelectProps = {
  value?: string
  onChange?: (value: string) => void
}

export function LanguageSelect({ value, onChange }: LanguageSelectProps) {
  const langOptions = useOrderedLangOptions()

  const [search, setSearch] = useState('')
  const filteredLangOptions = useMemo(() => {
    if (!search) return langOptions
    const lcSearch = search.toLowerCase()
    const matchOptions = langOptions.filter((o) => o.value === lcSearch)
    if (matchOptions.length) return matchOptions
    return langOptions
  }, [langOptions, search])

  return (
    <Select
      showSearch
      filterOption={(search, option) => {
        setSearch(search)
        return filterOptionLabel(search, option)
      }}
      popupMatchSelectWidth={false}
      value={value}
      onChange={onChange}
      placeholder={t('prompt.selectLanguage')}
      options={filteredLangOptions}
    ></Select>
  )
}
