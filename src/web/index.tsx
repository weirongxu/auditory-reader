import ReactDOM from 'react-dom/client'
import { App } from './app.js'
import './api.js'
import './locale/i18n.js'

const root = ReactDOM.createRoot(document.getElementById('app')!)

root.render(<App></App>)
