import { Book } from '@mui/icons-material'
import {
  Button,
  CircularProgress,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material'
import { useConfirm } from 'material-ui-confirm'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { booksMoveTopRouter } from '../../../core/api/books/move-top.js'
import { booksPageRouter } from '../../../core/api/books/page.js'
import { booksRemoveRouter } from '../../../core/api/books/remove.js'
import { useAction } from '../../../core/route/action.js'
import { async } from '../../../core/util/promise.js'
import { LinkWrap } from '../../components/link-wrap.js'
import { useHeaderItems } from '../layout/use-header.js'

export function BookList() {
  const nav = useNavigate()
  const [page, setPage] = useState(1)
  const { data: books, reload } = useAction(booksPageRouter, { page })
  const theme = useTheme()
  const confirm = useConfirm()
  const { t } = useTranslation()

  const HeaderRight = useMemo(() => {
    return (
      <>
        <LinkWrap to="/books/add">
          {(href) => <Button href={href}>{t('add')}</Button>}
        </LinkWrap>
      </>
    )
  }, [t])

  useHeaderItems({ right: HeaderRight })

  useEffect(() => {
    if (page) reload()
  }, [page, reload])

  if (!books) return <CircularProgress />

  const Pager = (
    <Pagination
      onChange={(_, page) => setPage(page)}
      page={page}
      count={books.pageCount}
    ></Pagination>
  )

  return (
    <>
      {Pager}
      <TableContainer
        sx={{
          marginTop: theme.spacing(2),
        }}
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('bookName')}</TableCell>
              <TableCell></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.items.map((book) => {
              return (
                <TableRow
                  hover
                  key={book.uuid}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    nav(`/books/view/${book.uuid}`)
                  }}
                >
                  <TableCell title={book.createdAt.toLocaleString()}>
                    {book.name}
                  </TableCell>
                  <TableCell>
                    <Stack
                      direction="row"
                      onClick={(e) => {
                        e.stopPropagation()
                      }}
                    >
                      <Button
                        color="secondary"
                        onClick={() => {
                          async(async () => {
                            await booksMoveTopRouter.action({
                              uuid: book.uuid,
                            })
                            reload()
                          })
                        }}
                      >
                        {t('top')}
                      </Button>
                      <LinkWrap to={`/books/edit/${book.uuid}`}>
                        {(href) => (
                          <Button color="success" href={href}>
                            {t('edit')}
                          </Button>
                        )}
                      </LinkWrap>
                      <Button
                        color="error"
                        onClick={() => {
                          confirm({
                            title: t('prompt.removeBook'),
                            description: book.name,
                          })
                            .then(async () => {
                              await booksRemoveRouter.action({
                                uuid: book.uuid,
                              })
                              reload()
                            })
                            .catch(() => {})
                        }}
                      >
                        {t('remove')}
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {Pager}
    </>
  )
}