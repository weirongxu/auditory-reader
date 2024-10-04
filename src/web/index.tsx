import '../bundle/jsdom.js'

import ReactDOM from 'react-dom/client'
import './api.js'
import { App } from './app.js'
import './locale/i18n.js'

const root = ReactDOM.createRoot(document.getElementById('root')!)

root.render(<App></App>)
