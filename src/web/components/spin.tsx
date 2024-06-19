import { Spin, type SpinProps } from 'antd'

export function SpinFullscreen(props: SpinProps) {
  return <Spin fullscreen size="large" {...props}></Spin>
}

export function SpinCenter(props: SpinProps) {
  return (
    <Spin
      {...props}
      style={{ width: '100%', padding: 20, ...props.style }}
    ></Spin>
  )
}
