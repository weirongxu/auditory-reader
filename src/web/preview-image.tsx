import { createGlobalState } from 'react-hooks-global-state'
import { PinchZoomPan } from './components/pinch-zoom-pan.js'

const { setGlobalState: setPreviewImg, useGlobalState: usePreviewImg } =
  createGlobalState<{
    src: string | null
  }>({ src: null })

export const setPreviewImgSrc = (src: string | null) => {
  setPreviewImg('src', src)
}

export function PreviewImage() {
  const [src, setSrc] = usePreviewImg('src')

  if (!src) return <></>

  return (
    <PinchZoomPan
      captureWheel
      onClose={() => {
        setSrc(null)
      }}
    >
      <img src={src} alt="preview" />
    </PinchZoomPan>
  )
}
