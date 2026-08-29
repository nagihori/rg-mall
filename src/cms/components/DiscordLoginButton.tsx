export default function DiscordLoginButton() {
  return (
    <div style={{ marginBottom: '1rem' }}>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Next.js のページではなく、OAuth開始用のAPIルートへの通常遷移 */}
      <a
        href="/api/auth/discord/login"
        style={{
          display: 'block',
          textAlign: 'center',
          padding: '0.75rem 1rem',
          borderRadius: '4px',
          backgroundColor: '#5865F2',
          color: '#fff',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        Discordでログイン
      </a>
    </div>
  )
}
