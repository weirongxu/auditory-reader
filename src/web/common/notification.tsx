import { atom, useAtom } from 'jotai'
import { message, notification } from 'antd'
import type { NotificationInstance } from 'antd/es/notification/interface.js'
import { globalStore } from '../store/global.js'
import { useEffect } from 'react'
import type { MessageInstance } from 'antd/es/message/interface.js'

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
