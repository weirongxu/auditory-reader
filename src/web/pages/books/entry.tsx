import { Route, Routes } from 'react-router-dom'
import { NotFound } from '../not-found.js'
import { BookAddSuccessful } from './add-successful.js'
import { BookAdd } from './add.js'
import { BookEditDialog } from './edit.js'
import { BookList } from './index.js'
import { BookView } from './view.js'

export function BooksEntry() {
  return (
    <>
      <BookEditDialog></BookEditDialog>
      <Routes>
        <Route path="/" element={<BookList></BookList>}></Route>
        <Route path="/add" element={<BookAdd></BookAdd>}></Route>
        <Route
          path="/added-successful/:uuid"
          element={<BookAddSuccessful></BookAddSuccessful>}
        ></Route>
        <Route path="/view/:uuid" element={<BookView></BookView>}></Route>
        <Route path="*" element={<NotFound title="page"></NotFound>}></Route>
      </Routes>
    </>
  )
}
