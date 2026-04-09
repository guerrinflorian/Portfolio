// Auteur : GUERRINF - Florian Guerrin
// Server route - proxy OpenSky Network (pas de CORS cote serveur Node.js)
// Authentification Basic Auth via OPENSKY_USER / OPENSKY_PASS (variables Vercel)
// En cas d'echec : retourne states vides pour ne pas bloquer l'UI

// Zone couverte : ~80km autour de Bure (Moselle)
const LAMIN = 48.9
const LOMIN = 5.2
const LAMAX = 49.8
const LOMAX = 6.7

export default defineEventHandler(async (event) => {
  const lConfig = useRuntimeConfig(event)
  const lUrl    = `https://opensky-network.org/api/states/all?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`

  const lHeaders: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'portfolio-florian-guerrin/1.0',
  }

  // Ajout du header Authorization si les identifiants sont configurés
  if (lConfig.openskyUser && lConfig.openskyPass) {
    const lToken = Buffer.from(`${lConfig.openskyUser}:${lConfig.openskyPass}`).toString('base64')
    lHeaders['Authorization'] = `Basic ${lToken}`
  }

  try {
    const lData = await $fetch(lUrl, { headers: lHeaders, timeout: 8000 })
    return lData
  } catch (lErr: unknown) {
    const lMsg = lErr instanceof Error ? lErr.message : 'Erreur inconnue'
    console.warn('[server/api/planes] OpenSky indisponible :', lMsg)
    // Retour gracieux : pas d'avions plutot qu'une erreur 502
    return { time: Math.floor(Date.now() / 1000), states: null }
  }
})
