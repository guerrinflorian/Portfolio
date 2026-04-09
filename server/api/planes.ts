// Auteur : GUERRINF - Florian Guerrin
// Server route - proxy OpenSky Network (pas de CORS côté serveur Node.js)

// Zone couverte : ~80km autour de Bure (Moselle)
const LAMIN = 48.9
const LOMIN = 5.2
const LAMAX = 49.8
const LOMAX = 6.7

export default defineEventHandler(async () => {
  const lUrl = `https://opensky-network.org/api/states/all?lamin=${LAMIN}&lomin=${LOMIN}&lamax=${LAMAX}&lomax=${LOMAX}`

  try {
    const lData = await $fetch(lUrl)
    return lData
  } catch (lErr: unknown) {
    const lMsg = lErr instanceof Error ? lErr.message : 'Erreur inconnue'
    console.warn('[server/api/planes] Erreur OpenSky :', lMsg)
    throw createError({ statusCode: 502, message: 'Impossible de récupérer les données de vol' })
  }
})
