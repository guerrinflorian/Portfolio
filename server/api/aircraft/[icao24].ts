// Auteur : GUERRINF - Florian Guerrin
// Server route - détails avion par ICAO24 via hexdb.io

interface HexdbResponse {
  ModeS:            string
  Registration:     string
  Manufacturer:     string
  Type:             string
  RegisteredOwners: string
  ICAO:             string
  operatorFlag:     string
}

export interface AircraftDetails {
  registration: string
  manufacturer: string
  type:         string
  operator:     string
}

export default defineEventHandler(async (event) => {
  const lIcao24 = getRouterParam(event, 'icao24')
  if (!lIcao24) throw createError({ statusCode: 400, message: 'ICAO24 manquant' })

  try {
    const lData = await $fetch<HexdbResponse>(`https://hexdb.io/api/v1/aircraft/${lIcao24.toLowerCase()}`)

    return {
      registration: lData.Registration  ?? '',
      manufacturer: lData.Manufacturer  ?? '',
      type:         lData.Type          ?? '',
      operator:     lData.RegisteredOwners ?? '',
    } satisfies AircraftDetails
  } catch {
    // Avion inconnu dans la base - retourner vide sans erreur bloquante
    return { registration: '', manufacturer: '', type: '', operator: '' } satisfies AircraftDetails
  }
})
