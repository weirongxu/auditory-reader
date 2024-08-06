import { useMediaQuery } from '@react-hookz/web'
import { App, ConfigProvider, theme } from 'antd'
import { useUserColorScheme, type ColorScheme } from './store.js'

const { defaultAlgorithm, darkAlgorithm } = theme

export const useColorScheme = (): ColorScheme => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [userColorScheme] = useUserColorScheme()

  const mode: ColorScheme =
    userColorScheme === 'system'
      ? prefersDarkMode
        ? 'dark'
        : 'light'
      : userColorScheme

  return mode
}

export const AntdConfigProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const colorScheme = useColorScheme()
  return (
    <ConfigProvider
      theme={{
        algorithm: colorScheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        components: {
          InputNumber: {
            handleVisible: true,
          },
        },
      }}
    >
      <App className="app">{children}</App>
    </ConfigProvider>
  )
}
