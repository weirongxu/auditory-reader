import '../bundle/jsdom.js'
import './api.js'
import './locale/i18n.js'

import ReactDOM from 'react-dom/client'

import { App } from './app.js'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(<App></App>)
