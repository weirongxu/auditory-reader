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
          variant: 'outlined',
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
      MuiTableCell: {
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
      MuiFilledInput: {
        defaultProps: {
          margin: 'dense',
        },
      },
      MuiFormControl: {
        defaultProps: {
          margin: 'dense',
        },
      },
      MuiFormHelperText: {
        defaultProps: {
          margin: 'dense',
        },
      },
      MuiInputBase: {
        defaultProps: {
          margin: 'dense',
        },
      },
      MuiInputLabel: {
        defaultProps: {
          margin: 'dense',
        },
      },
      MuiListItem: {
        defaultProps: {
          dense: true,
        },
      },
      MuiOutlinedInput: {
        defaultProps: {
          margin: 'dense',
        },
      },
      MuiFab: {
        defaultProps: {
          size: 'small',
        },
      },
      MuiToolbar: {
        defaultProps: {
          variant: 'dense',
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
