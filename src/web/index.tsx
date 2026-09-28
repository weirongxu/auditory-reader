import '../bundle/jsdom.js'
import './api.js'
import './locale/i18n.js'
import ReactDOM from 'react-dom/client'

import { App } from './app.js'

const rootElem = document.getElementById('root')
if (!rootElem) throw new Error('root element not found')
const root = ReactDOM.createRoot(rootElem)

root.render(<App></App>)
