import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPublicStore } from '@/lib/repositories/stores'
import { StoreDetailView } from '@/components/StoreDetailView'
export const revalidate = 60

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const store = await getPublicStore((await params).slug)
  if (!store) return {}
  return {
    title: store.name,
    description: store.summary,
    openGraph: {
      title: store.name,
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
