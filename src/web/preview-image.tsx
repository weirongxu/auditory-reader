import { PinchZoomPan } from './components/pinch-zoom-pan.js'
import { createGlobalState } from './hooks/createGlobalState.js'

const { setGlobalState: setPreviewImgSrc, useGlobalState: usePreviewImgSrc } =
  createGlobalState<string | null>(null)

export { setPreviewImgSrc }

export function PreviewImage() {
  const [src, setSrc] = usePreviewImgSrc()

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
