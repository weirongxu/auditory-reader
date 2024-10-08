import { env } from '../../core/env.js'

async function unregister() {
  if (!('serviceWorker' in navigator)) return
  const registrations = await navigator.serviceWorker.getRegistrations()
  for (const registration of registrations) {
    await registration.unregister()
  }
}

export async function registerAPI() {
  if (env.appMode === 'server') {
    await unregister()
    return 'successful'
  }
  if (!('serviceWorker' in navigator)) {
    // eslint-disable-next-line no-console
    console.log('service-worker: unsupported')
    return 'unsupported'
  }
  await unregister()
  const appPublicRoot = env.appPublicRoot
  const service = await navigator.serviceWorker.register(
    new URL('./api', import.meta.url),
    {
      scope: appPublicRoot,
    },
  )
  await navigator.serviceWorker.ready
  if (service.active) {
    // eslint-disable-next-line no-console
    console.log('service-worker: registered')
    return 'successful'
  }
  return 'failed'
}
