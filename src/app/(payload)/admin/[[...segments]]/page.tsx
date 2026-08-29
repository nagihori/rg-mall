import { RootPage } from '@payloadcms/next/views'
import { getPayload } from 'payload'
import config from '@payload-config'
export const dynamic = 'force-dynamic'
export default async function Page({ params, searchParams }: { params: Promise<{ segments: string[] }>; searchParams: Promise<Record<string, string | string[]>> }) {
  const payload = await getPayload({ config })
  return RootPage({ config, importMap: payload.importMap, params, searchParams })
}
