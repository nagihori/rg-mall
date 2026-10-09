import { PayloadIcon } from '@payloadcms/ui'
import { getSiteSettings } from '@/lib/repositories/siteSettings'
import { SITE_NAME } from '@/lib/siteMeta'
import { detectEnvironment, environmentLabels } from '@/lib/environment'

// 商店街名(サイト設定のmallName)と環境バッジを並べる。主な目的は開発・staging・本番の取り違え防止。
async function load() {
  let name = SITE_NAME
  let faviconUrl: string | null = null
  try {
    const settings = await getSiteSettings()
    name = settings.mallName || SITE_NAME
    faviconUrl = settings.faviconUrl
  } catch {
    // 設定が読めなくても管理画面の表示は止めない
  }
  const environment = detectEnvironment({ vercelEnv: process.env.VERCEL_ENV, gitRef: process.env.VERCEL_GIT_COMMIT_REF })
  return { name, faviconUrl, environment }
}

// 本番では利用者(編集者)を混乱させないよう出さない。開発・stagingだけ色付きで示す。
const Badge = ({ environment }: { environment: ReturnType<typeof detectEnvironment> }) =>
  environment === 'production' ? null : <span className={`admin-env-badge admin-env-badge--${environment}`}>{environmentLabels[environment]}</span>

// サイドメニュー最上部用
export const SiteTitle = async () => {
  const { name, environment } = await load()
  return (
    <div className="admin-site-title">
      <span className="admin-site-title__name">{name}</span>
      <Badge environment={environment} />
    </div>
  )
}

// パンくずの「ホーム」部分(graphics.Icon)用。ファビコン(未設定ならPayloadのアイコン) + 商店街名。
export const SiteTitleIcon = async () => {
  const { name, faviconUrl, environment } = await load()
  return (
    <span className="admin-site-title admin-site-title--crumb">
      {faviconUrl ? <img className="admin-site-title__icon" src={faviconUrl} alt="" width={18} height={18} /> : <PayloadIcon />}
      <span className="admin-site-title__name">{name}</span>
      <Badge environment={environment} />
    </span>
  )
}

export default SiteTitle
