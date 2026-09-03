import { message, notification } from 'antd'
import type { MessageInstance } from 'antd/es/message/interface.js'
import type { NotificationInstance } from 'antd/es/notification/interface.js'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'

import { globalStore } from '../store/global.js'

const notificationApiAtom = atom<NotificationInstance | null>(null)

export const notificationApi = () => {
  const api = globalStore.get(notificationApiAtom)
  if (api) return api
  return notification
}

export function NotificationProvider() {
  const [api, contextHolder] = notification.useNotification({
    placement: 'top',
    duration: 3,
  })
  const [, setNotificationApi] = useAtom(notificationApiAtom)
  useEffect(() => {
    setNotificationApi(api)
  }, [api, setNotificationApi])
  return contextHolder
}

const messageApiAtom = atom<null | MessageInstance>(null)

export const messageApi = () => {
  const api = globalStore.get(messageApiAtom)
  if (api) return api
  return message
}

export function MessageProvider() {
  const [messageApi, contextHolder] = message.useMessage({
    duration: 3,
  })
  const [, setMessageApi] = useAtom(messageApiAtom)
  useEffect(() => {
    setMessageApi(messageApi)
  }, [messageApi, setMessageApi])
  return contextHolder
}
