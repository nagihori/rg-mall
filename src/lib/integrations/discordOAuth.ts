const DISCORD_AUTHORIZE_URL = 'https://discord.com/oauth2/authorize'
const DISCORD_TOKEN_URL = 'https://discord.com/api/oauth2/token'
const DISCORD_USER_URL = 'https://discord.com/api/users/@me'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

export function buildDiscordAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv('DISCORD_CLIENT_ID'),
    redirect_uri: requireEnv('DISCORD_REDIRECT_URI'),
    response_type: 'code',
    scope: 'identify',
    state,
    prompt: 'consent',
  })
  return `${DISCORD_AUTHORIZE_URL}?${params.toString()}`
}

export async function exchangeDiscordCode(code: string): Promise<{ access_token: string }> {
  const body = new URLSearchParams({
    client_id: requireEnv('DISCORD_CLIENT_ID'),
    client_secret: requireEnv('DISCORD_CLIENT_SECRET'),
    grant_type: 'authorization_code',
    code,
    redirect_uri: requireEnv('DISCORD_REDIRECT_URI'),
  })
  const response = await fetch(DISCORD_TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  if (!response.ok) throw new Error(`Discord token exchange failed: ${response.status}`)
  return response.json()
}

export async function fetchDiscordUser(accessToken: string): Promise<{ id: string; username: string }> {
  const response = await fetch(DISCORD_USER_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error(`Discord user fetch failed: ${response.status}`)
  const data = await response.json()
  return { id: data.id, username: data.username }
}
