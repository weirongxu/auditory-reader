import { createTheme, useMediaQuery } from '@mui/material'
import { useMemo } from 'react'
import { useUserColorScheme } from '../core/store.js'

export const useAppTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const [userColorScheme] = useUserColorScheme()

  const localTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode:
          userColorScheme === 'system'
            ? prefersDarkMode
              ? 'dark'
              : 'light'
            : userColorScheme,
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
  }, [prefersDarkMode, userColorScheme])

  return localTheme
}
