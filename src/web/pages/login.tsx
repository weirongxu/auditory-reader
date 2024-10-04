import { Button, Form, Input } from 'antd'
import { t } from 'i18next'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginRouter } from '../../core/api/login.js'
import { userRouter } from '../../core/api/user.js'
import { useAction } from '../../core/route/action.js'

type Values = {
  account: string
  password: string
}

export function Login() {
  const nav = useNavigate()
  const [error, setError] = useState<string>()
  const { data: user } = useAction(userRouter, null)
  const [form] = Form.useForm()

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
        <h4>{t('login')}</h4>

        <Form<Values>
          form={form}
          initialValues={{ account: '', password: '' }}
          onFinish={(values) => {
            loginRouter
              .json(values)
              .then(async (res) => {
                if (res.ok) {
                  nav('/')
                } else {
                  setError(t('error.login'))
                }
              })
              .catch(console.error)
          }}
        >
          <Form.Item
            label={t('account')}
            name="account"
            rules={[{ required: true }]}
          >
            <Input placeholder={t('prompt.inputAccount')}></Input>
          </Form.Item>
          <Form.Item
            label={t('password')}
            name="password"
            rules={[{ required: true }]}
            validateStatus={error ? 'error' : undefined}
            help={error}
          >
            <Input
              type="password"
              placeholder={t('prompt.inputPassword')}
            ></Input>
          </Form.Item>
          <Form.Item>
            <Button type="primary" block htmlType="submit">
              {t('submit')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}
