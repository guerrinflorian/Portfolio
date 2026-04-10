// Auteur : GUERRINF - Florian Guerrin
// Route serveur - infos visiteur via ip-api.com (proxied, évite CORS)

import { defineEventHandler, getHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const lForwarded = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
  const lRealIp    = getHeader(event, 'x-real-ip')
  const lSocketIp  = event.node.req.socket?.remoteAddress

  const lIp = lForwarded || lRealIp || lSocketIp || ''

  // En dev (localhost) on laisse ip-api détecter l'IP automatiquement
  const lIsLocal = lIp === '::1' || lIp === '127.0.0.1' || lIp === ''
  const lTarget  = lIsLocal ? '' : lIp

  try {
    const lRes = await fetch(
      `http://ip-api.com/json/${lTarget}?fields=status,country,regionName,city,isp,query&lang=fr`,
      { signal: AbortSignal.timeout(4000) }
    )
    if (!lRes.ok) return { ok: false }

    const lData = await lRes.json() as Record<string, string>
    if (lData['status'] !== 'success') return { ok: false }

    return {
      ok:      true,
      ip:      lData['query']      ?? '',
      city:    lData['city']       ?? '',
      region:  lData['regionName'] ?? '',
      country: lData['country']    ?? '',
      isp:     lData['isp']        ?? '',
    }
  } catch {
    return { ok: false }
  }
})
