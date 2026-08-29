export default function DiscordLoginButton() {
  return (
    <div style={{ marginBottom: '1rem' }}>
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
