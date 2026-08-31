import type { Metadata } from 'next'
import { Shippori_Mincho_B1, Zen_Kaku_Gothic_New } from 'next/font/google'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { SiteChrome } from '@/components/SiteChrome'
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/siteMeta'
import '@/styles/globals.css'

// 看板の和文明朝(ブランド見出し)と、店頭サインの角ゴシック(本文・UI)の二層構成
const shippori = Shippori_Mincho_B1({ subsets: ['latin'], weight: ['400', '700'], variable: '--font-mincho' })
const zenKaku = Zen_Kaku_Gothic_New({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-gothic' })

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s « ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
}
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${shippori.variable} ${zenKaku.variable}`}>
      <body>
        <SiteChrome>{children}</SiteChrome>
        <SpeedInsights />
      </body>
    </html>
  )
}
