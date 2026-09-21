import type { Metadata } from 'next'
import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SiteChrome } from '@/components/SiteChrome'
import { getSiteSettings } from '@/lib/repositories/siteSettings'
import '@/styles/globals.css'

// 看板の和文明朝(ブランド見出し)と、店頭サインの角ゴシック(本文・UI)の二層構成
const shippori = Shippori_Mincho_B1({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mincho' })
const zenKaku = Zen_Kaku_Gothic_New({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-gothic' })

// アーカイブ・利用規約等、個別にtitleを持たないページはここのtemplateで`%s « 商店街名`にラップされる
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: { default: settings.mallName, template: `%s « ${settings.mallName}` },
    description: settings.siteDescription,
  }
}
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSiteSettings()
  return (
    <html lang="ja" className={`${shippori.variable} ${zenKaku.variable}`}>
      <body>
        <SiteChrome settings={settings}>{children}</SiteChrome>
        <SpeedInsights />
      </body>
    </html>
  )
}
