import type { GalleryImageViewModel } from '@/lib/presenters/event'
import { LightboxTrigger } from '@/components/EventLightbox'

// indexOffset: メイン画像もライトボックスのスライド列に含めている場合、その分だけギャラリーの開始位置をずらす
export function EventGallery({ images, indexOffset = 0 }: { images: GalleryImageViewModel[]; indexOffset?: number }) {
  if (images.length === 0) return null
  return (
    <div className="gallery">
      {images.map((image, i) => (
        <LightboxTrigger key={i} index={i + indexOffset} className="gallery-item">
          <img src={image.url} alt={image.alt} loading="lazy" decoding="async" />
        </LightboxTrigger>
      ))}
    </div>
  )
}
