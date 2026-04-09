// Auteur : GUERRINF - Florian Guerrin
// Composable - avions en temps réel via adsb.fi (CORS-compatible navigateur)

import { ref, onMounted, onUnmounted } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Plane {
  icao24:       string
  callsign:     string
  registration: string
  type:         string
  longitude:    number
  latitude:     number
  altitude:     number    // mètres
  velocity:     number    // m/s
  heading:      number    // degrés, sens horaire depuis le nord
  verticalRate: number    // m/s (positif = montée)
}

interface AdsbFiAircraft {
  hex:       string
  flight?:   string
  r?:        string           // immatriculation
  t?:        string           // type OACI (ex: A320)
  lat?:      number
  lon?:      number
  alt_baro?: number | 'ground'
  gs?:       number           // knots
  track?:    number
  baro_rate?: number          // feet/min
}

interface AdsbFiResponse {
  ac:    AdsbFiAircraft[]
  ctime: number
}

// ─── Constantes ───────────────────────────────────────────────────────────────

// Centre : Moselle (Metz), rayon 200 km couvre Luxembourg + Saarbrücken + Nancy
const LAT_CENTER = 49.4167
const LON_CENTER = 6.0000
const RADIUS_KM  = 200

const REFRESH_MS = 60_000   // 60s
const CACHE_KEY  = 'planes_cache'
const CACHE_TTL  = 55_000

// ─── Conversions ──────────────────────────────────────────────────────────────

function calcFtToM(pFt: number): number  { return pFt * 0.3048 }
function calcKtToMs(pKt: number): number { return pKt * 0.5144 }

// ─── Composable ───────────────────────────────────────────────────────────────

export function usePlanes() {
  const mPlanes  = ref<Plane[]>([])
  const mLoading = ref(false)
  const mError   = ref<string | null>(null)

  let mIntervalId: ReturnType<typeof setInterval> | null = null

  async function fetchPlanes(): Promise<void> {
    if (!import.meta.client) return
    mLoading.value = true
    mError.value   = null

    try {
      // Cache sessionStorage pour respecter le quota API
      const lCached = sessionStorage.getItem(CACHE_KEY)
      if (lCached) {
        const lParsed = JSON.parse(lCached) as { ts: number; data: Plane[] }
        if (Date.now() - lParsed.ts < CACHE_TTL) {
          mPlanes.value  = lParsed.data
          mLoading.value = false
          return
        }
      }

      const lUrl = `https://api.adsb.fi/v1/aircraft?lat=${LAT_CENTER}&lon=${LON_CENTER}&radius=${RADIUS_KM}`
      const lResponse = await fetch(lUrl)
      if (!lResponse.ok) throw new Error(`adsb.fi erreur HTTP ${lResponse.status}`)

      const lData = await lResponse.json() as AdsbFiResponse

      const lPlanes: Plane[] = (lData.ac ?? [])
        .filter(lAc => {
          // Garder uniquement les avions en vol avec position et altitude valides
          if (lAc.lat === undefined || lAc.lon === undefined) return false
          if (lAc.alt_baro === undefined || lAc.alt_baro === 'ground') return false
          return lAc.alt_baro > 1640  // > 500m (1640ft) = clairement en vol
        })
        .slice(0, 25)
        .map(lAc => ({
          icao24:       lAc.hex.trim(),
          callsign:     (lAc.flight ?? lAc.r ?? lAc.hex).trim() || lAc.hex.toUpperCase(),
          registration: (lAc.r ?? '').trim(),
          type:         (lAc.t ?? '').trim(),
          longitude:    lAc.lon!,
          latitude:     lAc.lat!,
          altitude:     calcFtToM(lAc.alt_baro as number),
          velocity:     calcKtToMs(lAc.gs ?? 0),
          heading:      lAc.track ?? 0,
          verticalRate: calcFtToM((lAc.baro_rate ?? 0) / 60),  // ft/min → m/s
        }))

      mPlanes.value = lPlanes
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: lPlanes }))
    } catch (lErr: unknown) {
      mError.value = lErr instanceof Error ? lErr.message : 'Erreur inconnue'
      console.warn('[usePlanes] Impossible de récupérer les avions :', mError.value)
    } finally {
      mLoading.value = false
    }
  }

  onMounted(() => {
    void fetchPlanes()
    mIntervalId = setInterval(() => void fetchPlanes(), REFRESH_MS)
  })

  onUnmounted(() => {
    if (mIntervalId !== null) clearInterval(mIntervalId)
  })

  return { mPlanes, mLoading, mError }
}
