/// <reference lib="webworker"/>

import '../../bundle/jsdom.js'
import { ROUTERS } from '../../core/api/index.js'
import { getActionPath } from '../../core/route/action.js'
import { URequest } from '../../core/route/request.js'
import { UResponse, UResponseHold } from '../../core/route/response.js'
import { ErrorRequestResponse } from '../../core/route/session.js'
import { toError } from '../../core/util/errors.js'

export default null
declare let self: ServiceWorkerGlobalScope

function toBodyInit(body: unknown): BodyInit | null {
  if (body == null) return null
  if (
    typeof body === 'string' ||
    body instanceof ArrayBuffer ||
    body instanceof Blob
  )
    return body
  if (ArrayBuffer.isView(body)) {
    // NOTE: Node Buffer/typed arrays are ArrayBuffer-backed here; the DOM type
    // just tracks the wider ArrayBufferLike.
    return body as ArrayBufferView<ArrayBuffer>
  }
  return JSON.stringify(body)
}

self.addEventListener('install', (event) => {
  // eslint-disable-next-line no-console
  console.debug('service-worker: installed')
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  // eslint-disable-next-line no-console
  console.log('service-worker: activate event in progress.')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)

  if (
    url.hostname !== location.hostname ||
    !url.pathname.startsWith(getActionPath(''))
  )
    return
  const router = ROUTERS.find((r) =>
    r.isMatch({ method: req.method, pathname: url.pathname }),
  )

  if (router?.handler) {
    const resH = new UResponseHold()
    event.respondWith(
      Promise.resolve(
        router.handler({
          req: URequest.fromBrowser<unknown>(
            req,
            router.getDynamicPaths(url.pathname),
          ),
          res: UResponse.fromBrowser(resH),
        }),
      )
        .then((body) => toBodyInit(body))
        .then(
          (data) =>
            new Response(data, {
              status: resH.status ?? 200,
              headers: resH.headers,
            }),
        )
        .catch((error: unknown) => {
          if (error instanceof ErrorRequestResponse) {
            return new Response(JSON.stringify({ message: error.message }), {
              status: 400,
              headers: resH.headers,
            })
          }
          const msg = toError(error).message
          console.error(error)
          return new Response(JSON.stringify({ message: msg }), {
            status: 500,
            headers: resH.headers,
          })
        }),
    )
  }
})
