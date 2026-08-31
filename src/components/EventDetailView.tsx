import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { EventCardViewModel, EventDetailViewModel } from '@/lib/presenters/event'
import { EventRibbon } from '@/components/EventRibbon'
import { EventGallery } from '@/components/EventGallery'
import { BackToTopBar } from '@/components/BackToTopBar'
import { EventPagination } from '@/components/EventPagination'
import { LightboxProvider, LightboxTrigger } from '@/components/EventLightbox'

type AdjacentEvents = { prev: EventCardViewModel | null; next: EventCardViewModel | null }

export function EventDetailView({ event, previewLabel, adjacent }: { event: EventDetailViewModel; previewLabel?: string; adjacent?: AdjacentEvents }) {
  const slides = [
    ...(event.fullImage ? [{ src: event.fullImage.zoomUrl, alt: event.fullImage.alt }] : []),
    ...event.gallery.map((image) => ({ src: image.zoomUrl, alt: image.alt })),
  ]
  const galleryOffset = event.fullImage ? 1 : 0
  return (
    <LightboxProvider slides={slides}>
      <article className="event-page">
        <BackToTopBar />
        <div className="event-hero">
          {event.fullImage && <img src={event.fullImage.url} alt="" className="event-hero-bg" loading="eager" fetchPriority="high" decoding="async" />}
          <div className="event-hero-overlay" />
          <EventRibbon category={event.category} />
          <div className="event-hero-inner">
            {previewLabel && <p className="event-preview-flag">{previewLabel}</p>}
            <h1>{event.title}</h1>
            {event.shortDate && <span className="date-tag">{event.shortDate}</span>}
          </div>
        </div>
        <div className="event-info">
          {event.fullImage && (
            <LightboxTrigger index={0} className="event-info-media">
              <img src={event.fullImage.url} alt={event.fullImage.alt} loading="lazy" decoding="async" />
            </LightboxTrigger>
          )}
          <div className="event-info-meta">
            <p>{event.summary}</p>
            <dl>
              <div><dt>期間</dt><dd>{event.period}</dd></div>
              {event.location && <div><dt>場所</dt><dd>{event.location}</dd></div>}
            </dl>
          </div>
        </div>
        {event.body ? <div className="prose"><RichText data={event.body as SerializedEditorState} /></div> : null}
        <EventGallery images={event.gallery} indexOffset={galleryOffset} />
        {adjacent && <EventPagination prev={adjacent.prev} next={adjacent.next} />}
      </article>
    </LightboxProvider>
  )
}
