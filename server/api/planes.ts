// Auteur : GUERRINF - Florian Guerrin
// Server route - proxy OpenSky Network via OAuth2 client credentials
// Variables Vercel : OPENSKY_CLIENT_ID + OPENSKY_CLIENT_SECRET
// Sans credentials : tentative anonyme avec fallback gracieux (states vides)

// Zone couverte : ~60km autour de Bure (Moselle) - 49.35°N, 5.95°E
const LAMIN = 48.82
const LOMIN = 5.13
const LAMAX = 49.88
const LOMAX = 6.77

const TOKEN_URL = 'https://auth.opensky-network.org/auth/realms/opensky-network/protocol/openid-connect/token'

// Cache du token en memoire (survive aux appels chauds Vercel, expiration 30min)
let mCachedToken:   string | null = null
let mTokenExpireAt: number        = 0

async function fetchToken(pClientId: string, pClientSecret: string): Promise<string> {
  const lNow = Date.now()
  if (mCachedToken && lNow < mTokenExpireAt) return mCachedToken

  const lResp = await $fetch<{ access_token: string; expires_in: number }>(TOKEN_URL, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     pClientId,
      client_secret: pClientSecret,
    }).toString(),
  })

  mCachedToken   = lResp.access_token
  mTokenExpireAt = lNow + (lResp.expires_in - 60) * 1000  // marge 60s avant expiration
  return mCachedToken
}

export default defineEventHandler(async (event) => {
  const lConfig = useRuntimeConfig(event)
  const lUrl    = `https://opensky-network.org/api/states/all?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`

  const lHeaders: Record<string, string> = {
    'Accept':     'application/json',
    'User-Agent': 'portfolio-florian-guerrin/1.0',
  }

  if (lConfig.openskyClientId && lConfig.openskyClientSecret) {
    try {
      const lToken = await fetchToken(lConfig.openskyClientId, lConfig.openskyClientSecret)
      lHeaders['Authorization'] = `Bearer ${lToken}`
    } catch (lErr) {
      console.warn('[server/api/planes] Echec obtention token OAuth2 :', lErr instanceof Error ? lErr.message : lErr)
    }
  }

  try {
    const lData = await $fetch(lUrl, { headers: lHeaders, timeout: 8000 })
    return lData
  } catch (lErr: unknown) {
    const lMsg = lErr instanceof Error ? lErr.message : 'Erreur inconnue'
    console.warn('[server/api/planes] OpenSky indisponible :', lMsg)
    return { time: Math.floor(Date.now() / 1000), states: null }
  }
})
