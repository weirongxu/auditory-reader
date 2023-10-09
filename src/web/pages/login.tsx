import { Button, TextField, Typography } from '@mui/material'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRouter } from '../../core/api/login.js'
import { userRouter } from '../../core/api/user.js'
import { useAction } from '../../core/route/action.js'
import { FlexBox } from '../components/flex-box.js'

export function Login() {
  const nav = useNavigate()
  const [account, setAccount] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>()
  const { data: user } = useAction(userRouter, null)

  useEffect(() => {
    if (user) {
      if (user.info) {
        nav('/')
      }
    }
  }, [nav, user])

  return (
    <>
      <div style={{ maxWidth: 300, margin: '50px auto 0' }}>
        <h2>Auditory Reader</h2>
        <Typography variant="h4">{t('login')}</Typography>

        <form
          onSubmitCapture={(evt) => {
            evt.preventDefault()
            const values = { account, password }
            loginRouter
              .action(values)
              .then(async (res) => {
                if (res.ok) {
                  nav('/')
                } else {
                  setError(t('error.login') ?? '')
                }
              })
              .catch(console.error)
          }}
        >
          <FlexBox gap={2}>
            <TextField
              required
              name="account"
              label={t('account')}
              placeholder={t('prompt.inputAccount')}
              onChange={(e) => {
                setAccount(e.target.value)
              }}
            ></TextField>

            <TextField
              required
              name="password"
              label={t('password')}
              type="password"
              placeholder={t('prompt.inputPassword')}
              error={!!error}
              helperText={error}
              onChange={(e) => {
                setPassword(e.target.value)
              }}
            ></TextField>

            <Button fullWidth type="submit">
              {t('submit')}
            </Button>
          </FlexBox>
        </form>
      </div>
    </>
  )
}
