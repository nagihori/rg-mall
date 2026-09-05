import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { StoreDetailViewModel } from '@/lib/presenters/store'
import { EventGallery } from '@/components/EventGallery'
import { BackToTopBar } from '@/components/BackToTopBar'
import { LightboxProvider, LightboxTrigger } from '@/components/EventLightbox'
import { LodestoneIcon } from '@/components/icons/LodestoneIcon'

export function StoreDetailView({ store }: { store: StoreDetailViewModel }) {
  const slides = [
    ...(store.media ? [{ src: store.media.zoomUrl, alt: store.media.alt }] : []),
    ...store.gallery.map((image) => ({ src: image.zoomUrl, alt: image.alt })),
  ]
  const galleryOffset = store.media ? 1 : 0
  return (
    <LightboxProvider slides={slides}>
      <article className="store-page">
        <BackToTopBar />
        {store.cover && (
          <div className="store-cover">
            <img src={store.cover.url} alt="" loading="eager" fetchPriority="high" decoding="async" />
          </div>
        )}
        <div className="store-body">
          {store.tagline && <p className="store-tagline">{store.tagline}</p>}
          <h1 className="store-title">{store.name}</h1>
          <div className="store-layout">
            {store.media && (
              <LightboxTrigger index={0} className="store-media">
                <img src={store.media.url} alt={store.media.alt} loading="lazy" decoding="async" />
              </LightboxTrigger>
            )}
            <div className="store-meta">
              <p>{store.summary}</p>
              <dl>
                <div>
                  <dt>オーナー</dt>
                  <dd className="store-owner">
                    {store.avatar && <img src={store.avatar.url} alt={store.avatar.alt} className="store-owner-avatar" loading="lazy" decoding="async" />}
                    <span>{store.owner}</span>
                    {store.ownerLodestoneUrl && (
                      <a href={store.ownerLodestoneUrl} target="_blank" rel="noreferrer" className="lodestone-link" aria-label="Lodestoneキャラクターページを見る">
                        <LodestoneIcon />
                      </a>
                    )}
                  </dd>
                </div>
                {store.businessHours && <div><dt>基本営業時間</dt><dd>{store.businessHours}</dd></div>}
                {store.snsLinks.length > 0 && (
                  <div>
                    <dt>SNS</dt>
                    <dd>
                      <div className="sns-links">
                        {store.snsLinks.map((link, i) => (
                          <a key={i} href={link.url} target="_blank" rel="noreferrer" className="sns-link">{link.label || link.url} ↗</a>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
          {store.body ? <div className="prose"><RichText data={store.body as SerializedEditorState} /></div> : null}
          {store.gallery.length > 0 && (
            <section>
              <h2>ギャラリー</h2>
              <EventGallery images={store.gallery} indexOffset={galleryOffset} />
            </section>
          )}
        </div>
      </article>
    </LightboxProvider>
  )
}
