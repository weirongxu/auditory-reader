import { faEye } from '@fortawesome/free-solid-svg-icons'
import { Alert, Button } from 'antd'
import { t } from 'i18next'
import { useParams } from 'react-router-dom'
import { FlexBox } from '../../components/flex-box.js'
import { Icon } from '../../components/icon.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { NotFound } from '../not-found.js'

export function BookAddSuccessful() {
  const { uuid } = useParams<{ uuid: string }>()

  if (!uuid) return <NotFound title="book"></NotFound>

  return (
    <FlexBox gap={4}>
      <Alert type="success" message={t('desc.bookAddedSuccessful')}></Alert>
      <LinkWrap to={`/books/view/${uuid}`}>
        {(href) => (
          <Button type="primary" href={href} icon={<Icon icon={faEye} />}>
            {t('view')}
          </Button>
        )}
      </LinkWrap>
    </FlexBox>
  )
}
