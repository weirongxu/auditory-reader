import { createTheme, useMediaQuery, type Theme } from '@mui/material'
import { atom, useAtom } from 'jotai'
import { useEffect } from 'react'
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

const themeAtom = atom<Theme>(createTheme())

export const useAppTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [theme, setTheme] = useAtom(themeAtom)
  const [userColorScheme] = useUserColorScheme()

  useEffect(() => {
    setTheme(
      createAppTheme(
        userColorScheme === 'system'
          ? prefersDarkMode
            ? 'dark'
            : 'light'
          : userColorScheme
      )
    )
  }, [prefersDarkMode, setTheme, userColorScheme])

  return theme
}
