import { NextRequest, NextResponse } from 'next/server'
import { generatePayloadCookie, jwtSign } from 'payload'
import { getPayload } from 'payload'
import config from '@payload-config'
import { exchangeDiscordCode, fetchDiscordUser } from '@/lib/integrations/discordOAuth'

const STATE_COOKIE = 'discord_oauth_state'

function loginError(request: NextRequest, reason: string) {
  const url = new URL('/admin/login', request.nextUrl.origin)
  url.searchParams.set('error', reason)
  const response = NextResponse.redirect(url)
  response.cookies.delete(STATE_COOKIE)
  return response
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const expectedState = request.cookies.get(STATE_COOKIE)?.value

  if (!code || !state || !expectedState || state !== expectedState) {
    return loginError(request, 'invalid_state')
  }

  let discordUser: { id: string; username: string }
  try {
    const { access_token } = await exchangeDiscordCode(code)
    discordUser = await fetchDiscordUser(access_token)
  } catch {
    return loginError(request, 'discord_exchange_failed')
  }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { discordId: { equals: discordUser.id } },
    limit: 1,
    overrideAccess: true,
  })

  const user = existing.docs[0]
  if (!user) {
    return loginError(request, 'user_not_registered')
  }

  if (user.discordUsername !== discordUser.username) {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: { discordUsername: discordUser.username },
      overrideAccess: true,
    })
  }

  const collectionConfig = payload.collections.users.config

  const { token } = await jwtSign({
    fieldsToSign: { id: user.id, collection: 'users', email: undefined },
    secret: payload.secret,
    tokenExpiration: collectionConfig.auth.tokenExpiration,
  })

  const cookie = generatePayloadCookie({
    collectionAuthConfig: collectionConfig.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
    token,
  })

  const response = NextResponse.redirect(new URL('/admin', request.nextUrl.origin))
  response.cookies.delete(STATE_COOKIE)
  response.cookies.set(cookie.name, cookie.value ?? '', {
    expires: cookie.expires ? new Date(cookie.expires) : undefined,
    httpOnly: cookie.httpOnly,
    path: cookie.path,
    sameSite: cookie.sameSite?.toLowerCase() as 'lax' | 'strict' | 'none' | undefined,
    secure: cookie.secure,
  })
  return response
}
