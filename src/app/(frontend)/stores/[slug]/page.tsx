import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicStore } from '@/lib/repositories/stores'
import { getSiteSettings } from '@/lib/repositories/siteSettings'
import { renderMetaTemplate } from '@/lib/siteMeta'
import { StoreDetailView } from '@/components/StoreDetailView'
export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [store, settings] = await Promise.all([getPublicStore((await params).slug), getSiteSettings()])
  if (!store) return {}
  const title = renderMetaTemplate(settings.storeTitleTemplate, { store_title: store.name, site_title: settings.mallName })
  return {
    title: { absolute: title },
    description: store.summary,
    openGraph: {
      title,
      description: store.summary,
      images: store.cover ? [{ url: store.cover.url }] : undefined,
    },
  }
}

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const store = await getPublicStore(slug)
  if (!store) notFound()
  return <StoreDetailView store={store} />
}
