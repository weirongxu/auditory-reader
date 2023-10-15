import { atom, useAtom } from 'jotai'
import { PinchZoomPan } from '../components/pinch-zoom-pan.js'

export const previewImgSrcAtom = atom<string | null>(null)

export function PreviewImageProvider() {
  const [src, setSrc] = useAtom(previewImgSrcAtom)

  if (!src) return <></>

  return (
    <PinchZoomPan
      onClose={() => {
        setSrc(null)
      }}
    >
      <img
        src={src}
        onLoad={(event) => {
          const img = event.currentTarget
          const imgRate = img.naturalWidth / img.naturalHeight
          const winRate = window.innerWidth / window.innerHeight
          if (imgRate > winRate) {
            if (img.naturalWidth > window.innerWidth) {
              img.width = window.innerWidth
              img.height = window.innerWidth / imgRate
            }
          } else {
            if (img.naturalHeight > window.innerHeight) {
              img.height = window.innerHeight
              img.width = window.innerHeight * imgRate
            }
          }
        }}
        alt="preview"
      />
    </PinchZoomPan>
  )
}
