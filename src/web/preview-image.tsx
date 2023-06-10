import { atom, useAtom } from 'jotai'
import { PinchZoomPan } from './components/pinch-zoom-pan.js'

export const previewImgSrcAtom = atom<string | null>(null)

export function PreviewImage() {
  const [src, setSrc] = useAtom(previewImgSrcAtom)

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
