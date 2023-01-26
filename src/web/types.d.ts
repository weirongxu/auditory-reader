import type { API } from './api.js'

declare global {
  interface Window {
    API: typeof API
  }
}
