import type { MetadataRoute } from 'next'
import { getSiteSettings } from '@/lib/repositories/siteSettings'

// 管理画面の「メタ情報」タブの設定に従い、検索エンジンのクロール可否を切り替える
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { allowSearchEngines } = await getSiteSettings()
  if (!allowSearchEngines) return { rules: { userAgent: '*', disallow: '/' } }
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] } }
}
