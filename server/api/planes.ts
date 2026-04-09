// Auteur : GUERRINF - Florian Guerrin
// Server route - proxy airplanes.live (ADS-B communautaire, pas de blocage datacenter)
// Retourne directement un tableau Plane[] pret a l'emploi cote client

import type { Plane } from '~/composables/usePlanes'

// Centre : Bure (49.35°N, 5.95°E) - rayon 33 nm (~60 km)
const API_URL = 'https://api.airplanes.live/v2/point/49.35/5.95/33'

// Altitude minimale pour filtrer les avions au sol ou tres bas
const ALT_MIN_M = 500

interface AirplanesLiveAc {
  hex:       string
  flight?:   string
  r?:        string          // immatriculation ex: F-GKXU
  t?:        string          // type OACI ex: B738
  lat?:      number
  lon?:      number
  alt_baro?: number | 'ground'
  gs?:       number          // vitesse sol en noeuds
  track?:    number          // cap vrai en degres
  baro_rate?: number         // taux montee/descente en ft/min
  squawk?:   string
  on_ground?: boolean
}

interface AirplanesLiveResponse {
  ac:    AirplanesLiveAc[]
  total: number
  now:   number
}

// Pays depuis prefixe d'immatriculation
function countryFromReg(pReg: string): string {
  if (!pReg) return ''
  if (pReg.startsWith('F-'))                              return 'France'
  if (pReg.startsWith('D-'))                              return 'Germany'
  if (pReg.startsWith('G-'))                              return 'United Kingdom'
  if (pReg.startsWith('OE-'))                             return 'Austria'
  if (pReg.startsWith('OO-'))                             return 'Belgium'
  if (pReg.startsWith('LX-'))                             return 'Luxembourg'
  if (pReg.startsWith('PH-'))                             return 'Netherlands'
  if (pReg.startsWith('HB-'))                             return 'Switzerland'
  if (pReg.startsWith('I-'))                              return 'Italy'
  if (pReg.startsWith('EC-'))                             return 'Spain'
  if (pReg.startsWith('CS-'))                             return 'Portugal'
  if (pReg.startsWith('SE-'))                             return 'Sweden'
  if (pReg.startsWith('LN-'))                             return 'Norway'
  if (pReg.startsWith('OH-'))                             return 'Finland'
  if (pReg.startsWith('OY-'))                             return 'Denmark'
  if (pReg.startsWith('SP-'))                             return 'Poland'
  if (pReg.startsWith('OK-'))                             return 'Czech Republic'
  if (pReg.startsWith('HA-'))                             return 'Hungary'
  if (pReg.startsWith('YR-'))                             return 'Romania'
  if (pReg.startsWith('LZ-'))                             return 'Bulgaria'
  if (pReg.startsWith('TC-'))                             return 'Turkey'
  if (pReg.startsWith('UR-'))                             return 'Ukraine'
  if (pReg.startsWith('RA-') || pReg.startsWith('RF-'))  return 'Russia'
  if (pReg.startsWith('TF-'))                             return 'Iceland'
  if (pReg.startsWith('9H-'))                             return 'Malta'
  if (pReg.startsWith('EI-'))                             return 'Ireland'
  if (pReg.startsWith('N'))                               return 'United States'
  if (pReg.startsWith('C-'))                              return 'Canada'
  if (pReg.startsWith('A6-'))                             return 'United Arab Emirates'
  if (pReg.startsWith('A7-'))                             return 'Qatar'
  if (pReg.startsWith('9V-'))                             return 'Singapore'
  if (pReg.startsWith('JA'))                              return 'Japan'
  if (pReg.startsWith('B-'))                              return 'China'
  if (pReg.startsWith('VT-'))                             return 'India'
  if (pReg.startsWith('VH-'))                             return 'Australia'
  if (pReg.startsWith('ZS-'))                             return 'South Africa'
  if (pReg.startsWith('PR-') || pReg.startsWith('PT-') || pReg.startsWith('PP-')) return 'Brazil'
  return ''
}

export default defineEventHandler(async (): Promise<Plane[]> => {
  try {
    const lData = await $fetch<AirplanesLiveResponse>(API_URL, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'portfolio-florian-guerrin/1.0' },
      timeout: 8000,
    })

    const lPlanes: Plane[] = (lData.ac ?? [])
      .filter(lAc => {
        const lAlt = typeof lAc.alt_baro === 'number' ? lAc.alt_baro * 0.3048 : 0
        return !lAc.on_ground && lAlt > ALT_MIN_M && lAc.lat != null && lAc.lon != null
      })
      .slice(0, 15)
      .map(lAc => ({
        icao24:       lAc.hex.trim(),
        callsign:     (lAc.flight?.trim() || lAc.hex.toUpperCase()),
        country:      countryFromReg(lAc.r ?? ''),
        longitude:    lAc.lon!,
        latitude:     lAc.lat!,
        altitude:     (lAc.alt_baro as number) * 0.3048,
        velocity:     (lAc.gs ?? 0) * 0.514444,
        heading:      lAc.track ?? 0,
        verticalRate: (lAc.baro_rate ?? 0) * 0.00508,
        squawk:       (lAc.squawk ?? '').trim(),
      }))

    return lPlanes
  } catch (lErr: unknown) {
    console.warn('[server/api/planes] airplanes.live indisponible :', lErr instanceof Error ? lErr.message : lErr)
    return []
  }
})
