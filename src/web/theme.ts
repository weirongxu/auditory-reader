import { createTheme, useMediaQuery } from '@mui/material'
import { useMemo } from 'react'
import { useUserColorScheme, type ColorScheme } from './store.js'

const createAppTheme = (mode: ColorScheme) =>
  createTheme({
    palette: {
      mode,
    },
    components: {
      MuiChip: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiStack: {
        defaultProps: {
          spacing: 1,
        },
      },
      MuiSlider: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiTextField: {
        defaultProps: {
          size: 'small',
          margin: 'dense',
          variant: 'standard',
        },
      },
      MuiSelect: {
        defaultProps: {
          size: 'small',
          margin: 'dense',
        },
      },
      MuiAutocomplete: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiCheckbox: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiTable: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiButtonGroup: {
        defaultProps: {
          variant: 'contained',
          size: 'small',
        },
      },
      MuiIconButton: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiButton: {
        defaultProps: {
          variant: 'contained',
          size: 'small',
        },
      },
    },
  })

const lightTheme = createAppTheme('light')
const darkTheme = createAppTheme('dark')

export const useAppTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [userColorScheme] = useUserColorScheme()

  const mode =
    userColorScheme === 'system'
      ? prefersDarkMode
        ? 'dark'
        : 'light'
      : userColorScheme

  const theme = useMemo(
    () => (mode === 'light' ? lightTheme : darkTheme),
    [mode],
  )

  return theme
}
