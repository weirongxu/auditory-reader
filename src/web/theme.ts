import { createTheme, useMediaQuery } from '@mui/material'
import { useMemo } from 'react'

export const useTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

  const localTheme = useMemo(() => {
    return createTheme({
      palette: {
        mode: prefersDarkMode ? 'dark' : 'light',
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
  }, [prefersDarkMode])

  return localTheme
}
