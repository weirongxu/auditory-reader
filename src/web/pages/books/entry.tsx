import { Route, Routes } from 'react-router-dom'
import { BookAdd } from './add.js'
import { BookEdit } from './edit.js'
import { BookList } from './index.js'
import { BookView } from './view.js'

export function BooksEntry() {
  return (
    <Routes>
      <Route path="/" element={<BookList></BookList>}></Route>
      <Route path="/add" element={<BookAdd></BookAdd>}></Route>
      <Route path="/view/:uuid" element={<BookView></BookView>}></Route>
      <Route path="/edit/:uuid" element={<BookEdit></BookEdit>}></Route>
    </Routes>
  )
}
