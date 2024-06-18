import { Spin } from 'antd'

export function SpinFullscreen() {
  return <Spin fullscreen size="large"></Spin>
}

export function SpinCenter() {
  return <Spin style={{ width: '100%', padding: 20 }}></Spin>
}
