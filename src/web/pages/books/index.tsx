import {
  Button,
  ButtonGroup,
  Checkbox,
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
import { t } from 'i18next'
import { useConfirm } from 'material-ui-confirm'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { booksDownloadRouter } from '../../../core/api/books/download.js'
import { booksMoveTopRouter } from '../../../core/api/books/move-top.js'
import { booksPageRouter } from '../../../core/api/books/page.js'
import { booksRemoveRouter } from '../../../core/api/books/remove.js'
import { useAction } from '../../../core/route/action.js'
import { async } from '../../../core/util/promise.js'
import { LinkWrap } from '../../components/link-wrap.js'

export function BookList() {
  const nav = useNavigate()
  const [page, setPage] = useState<number>()
  const { data: books, reload } = useAction(booksPageRouter, { page })
  const theme = useTheme()
  const confirm = useConfirm()

  const [lastSelectedIndex, setLastSelectedIndex] = useState<number>()
  const [selectedUuids, setSelectedUuids] = useState<string[]>([])
  const selectedBooks = useMemo(
    () =>
      books?.items.filter((book) => selectedUuids.includes(book.uuid)) ?? [],
    [books, selectedUuids]
  )

  const allSelected = useMemo(
    () => books?.items.every((book) => selectedUuids.includes(book.uuid)),
    [books, selectedUuids]
  )

  // if books reload, cancel selected
  useEffect(() => {
    if (books) setSelectedUuids([])
  }, [books])

  useEffect(() => {
    if (page) reload()
  }, [page, reload])

  if (!books) return <CircularProgress />

  const Pager =
    books.pageCount > 1 ? (
      <Pagination
        sx={{ marginTop: 2 }}
        onChange={(_, page) => setPage(page)}
        page={page ?? 1}
        count={books?.pageCount}
      ></Pagination>
    ) : null

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
              <TableCell>
                <Checkbox
                  title={t('all')}
                  checked={allSelected}
                  onClick={() => {
                    if (allSelected) setSelectedUuids([])
                    else setSelectedUuids(books.items.map((book) => book.uuid))
                  }}
                ></Checkbox>
              </TableCell>
              <TableCell>{t('bookName')}</TableCell>
              <TableCell>
                {!!selectedUuids.length && (
                  <ButtonGroup>
                    <>
                      <Button
                        color="error"
                        onClick={() => {
                          confirm({
                            title: t('remove'),
                            description: (
                              <ul>
                                {selectedBooks.map((book) => (
                                  <li key={book.uuid}>{book.name}</li>
                                ))}
                              </ul>
                            ),
                          })
                            .then(async () => {
                              for (const book of selectedBooks) {
                                await booksRemoveRouter.action({
                                  uuid: book.uuid,
                                })
                              }
                              reload()
                            })
                            .catch(console.error)
                        }}
                      >
                        {t('remove')}
                      </Button>
                      <Button
                        color="secondary"
                        onClick={() => {
                          async(async () => {
                            for (const book of [...selectedBooks].reverse()) {
                              await booksMoveTopRouter.action({
                                uuid: book.uuid,
                              })
                            }
                            reload()
                          })
                        }}
                      >
                        {t('top')}
                      </Button>
                    </>
                  </ButtonGroup>
                )}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.items.map((book, index) => {
              return (
                <TableRow
                  hover
                  key={book.uuid}
                  sx={{ cursor: 'pointer' }}
                  onClick={() => {
                    nav(`/books/view/${book.uuid}`)
                  }}
                >
                  <TableCell
                    onClick={(e) => {
                      e.stopPropagation()
                    }}
                  >
                    <Checkbox
                      checked={selectedUuids.includes(book.uuid)}
                      onClick={(event) => {
                        setLastSelectedIndex(index)
                        let checked = false
                        let targetUuids: string[]
                        if (
                          lastSelectedIndex !== undefined &&
                          lastSelectedIndex !== index &&
                          event.shiftKey
                        ) {
                          if (lastSelectedIndex < index)
                            targetUuids = books.items
                              .slice(lastSelectedIndex, index + 1)
                              .map((it) => it.uuid)
                          else
                            targetUuids = books.items
                              .slice(index, lastSelectedIndex + 1)
                              .map((it) => it.uuid)
                          checked = true
                        } else {
                          targetUuids = [book.uuid]
                          checked = !selectedUuids.includes(book.uuid)
                        }

                        let tmpUuids = [...selectedUuids]
                        for (const targetUuid of targetUuids) {
                          if (checked) {
                            if (!tmpUuids.includes(targetUuid))
                              tmpUuids = [...tmpUuids, targetUuid]
                          } else {
                            tmpUuids = tmpUuids.filter(
                              (uuid) => uuid !== targetUuid
                            )
                          }
                          setSelectedUuids(tmpUuids)
                        }
                      }}
                    ></Checkbox>
                  </TableCell>
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
                      <LinkWrap to={`/books/edit/${book.uuid}`}>
                        {(href) => (
                          <Button color="success" href={href}>
                            {t('edit')}
                          </Button>
                        )}
                      </LinkWrap>
                      <Button
                        onClick={() => {
                          window.open(
                            `${booksDownloadRouter.fullRoutePath}?uuid=${book.uuid}`,
                            '_blank'
                          )
                        }}
                      >
                        {t('export')}
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
