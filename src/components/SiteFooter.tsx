import Image from 'next/image'
import type { SiteSettingsViewModel } from '@/lib/repositories/siteSettings'

export function SiteFooter({ settings }: { settings: SiteSettingsViewModel }) {
  const { mallName, server, location, contactText, contactLinkUrl, recruitingText, recruitingUrl, footerImageUrl, footerImageAlt } = settings
  return (
    <footer className="site-footer">
      <Image src={footerImageUrl ?? '/images/hero.png'} alt={footerImageAlt} fill sizes="100vw" className="site-footer-bg" />
      <div className="site-footer-overlay" />
      <div className="site-footer-content container">
        <p className="site-footer-brand">{mallName}</p>
        {recruitingText && (
          recruitingUrl ? (
            <a href={recruitingUrl} target="_blank" rel="noreferrer" className="site-footer-link">
              {recruitingText} <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <p className="site-footer-link">{recruitingText}</p>
          )
        )}
        {(server || location || contactText) && (
          <dl className="site-footer-info">
            {server && (
              <div>
                <dt>サーバー</dt>
                <dd>{server}</dd>
              </div>
            )}
            {location && (
              <div>
                <dt>所在地</dt>
                <dd>{location}</dd>
              </div>
            )}
            {contactText && (
              <div>
                <dt>お問い合わせ</dt>
                <dd>
                  {contactLinkUrl ? (
                    <a href={contactLinkUrl} target="_blank" rel="noreferrer">{contactText}</a>
                  ) : (
                    contactText
                  )}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </footer>
  )
}
