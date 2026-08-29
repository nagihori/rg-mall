import { NextResponse } from 'next/server'
import { buildDiscordAuthorizeUrl } from '@/lib/integrations/discordOAuth'

const STATE_COOKIE = 'discord_oauth_state'

export async function GET() {
  const state = crypto.randomUUID()
  let authorizeUrl: string
  try {
    authorizeUrl = buildDiscordAuthorizeUrl(state)
  } catch {
    return NextResponse.json({ error: 'Discord OAuth is not configured' }, { status: 500 })
  }
  const response = NextResponse.redirect(authorizeUrl)
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  })
  return response
}
