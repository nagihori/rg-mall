import type { Metadata } from 'next'
import '@/styles/globals.css'
export const metadata: Metadata = { title: 'RG Mall イベント', description: 'ゲーム内イベントのお知らせ' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ja"><body>{children}</body></html> }
