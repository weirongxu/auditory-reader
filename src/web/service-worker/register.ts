import { env } from '../../core/env.js'

async function unregister() {
  if (!navigator.serviceWorker) return
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
  if (!navigator.serviceWorker) {
    // eslint-disable-next-line no-console
    console.log('service-worker: unsupported')
    return 'unsupported'
  }
  await unregister()
  const service = await navigator.serviceWorker.register(
    new URL('./api', import.meta.url),
    {
      scope: env.appPublicRoot,
    }
  )
  if (service.active) {
    // eslint-disable-next-line no-console
    console.log('service-worker: registered')
    return 'successful'
  }
  return 'failed'
}
