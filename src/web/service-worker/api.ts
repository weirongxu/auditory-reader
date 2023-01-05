/// <reference lib="webworker"/>

import isPlainObject from 'is-plain-obj'
import { ROUTERS } from '../../core/api/index.js'
import { getActionPath } from '../../core/route/action.js'
import { URequest } from '../../core/route/request.js'
import { UResponseHold, UResponse } from '../../core/route/response.js'

export default null
declare let self: ServiceWorkerGlobalScope

self.addEventListener('install', () => {
  // eslint-disable-next-line no-console
  console.log('service-worker: installed')
})

self.addEventListener('activate', () => {
  // eslint-disable-next-line no-console
  console.log('service-worker: activate event in progress.')
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
    r.isMatch({ method: req.method, pathname: url.pathname })
  )

  if (router?.handler) {
    const resH = new UResponseHold()
    event.respondWith(
      Promise.resolve(
        router.handler({
          req: URequest.fromBrowser<any>(
            req,
            router.getDynamicPaths(url.pathname)
          ),
          res: UResponse.fromBrowser(resH),
        })
      ).then((body: any) => {
        const data = isPlainObject(body) ? JSON.stringify(body) : body
        return new Response(data, {
          status: resH.status ?? 200,
          headers: resH.headers,
        })
      })
    )
  }
})
