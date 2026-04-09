// Auteur : GUERRINF - Florian Guerrin
// Composable - avions en temps réel via server route /api/planes (proxy OpenSky)

import { ref, onMounted, onUnmounted } from 'vue'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Plane {
  icao24:       string
  callsign:     string
  country:      string
  longitude:    number
  latitude:     number
  altitude:     number    // mètres (baro)
  velocity:     number    // m/s
  heading:      number    // degrés, sens horaire depuis le nord
  verticalRate: number    // m/s (positif = montée)
  squawk:       string    // code transpondeur 4 chiffres
}

type OpenSkyStateVector = [
  string,          // 0: icao24
  string | null,   // 1: callsign
  string,          // 2: origin_country
  number | null,   // 3: time_position
  number,          // 4: last_contact
  number | null,   // 5: longitude
  number | null,   // 6: latitude
  number | null,   // 7: baro_altitude (mètres)
  boolean,         // 8: on_ground
  number,          // 9: velocity (m/s)
  number | null,   // 10: true_track (degrés)
  number | null,   // 11: vertical_rate (m/s)
  number[] | null, // 12: sensors
  number | null,   // 13: geo_altitude
  string | null,   // 14: squawk
  boolean,         // 15: spi
  number           // 16: position_source
]

interface OpenSkyResponse {
  time:   number
  states: OpenSkyStateVector[] | null
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const REFRESH_MS = 5 * 60_000   // 5 minutes
const CACHE_KEY  = 'planes_cache'
const CACHE_TTL  = 4.5 * 60_000 // 4min30 - légèrement sous le refresh

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
      // Cache sessionStorage pour ne pas spammer le proxy
      const lCached = sessionStorage.getItem(CACHE_KEY)
      if (lCached) {
        const lParsed = JSON.parse(lCached) as { ts: number; data: Plane[] }
        if (Date.now() - lParsed.ts < CACHE_TTL) {
          mPlanes.value  = lParsed.data
          mLoading.value = false
          return
        }
      }

      // Appel à notre server route (même origine → pas de CORS)
      const lData = await $fetch<OpenSkyResponse>('/api/planes')

      const lPlanes: Plane[] = (lData.states ?? [])
        .filter(lS => {
          const lOnGround = lS[8]
          const lLon      = lS[5]
          const lLat      = lS[6]
          const lAlt      = lS[7]
          return !lOnGround && lLon !== null && lLat !== null && lAlt !== null && lAlt > 500
        })
        .slice(0, 15)
        .map(lS => ({
          icao24:       lS[0].trim(),
          callsign:     ((lS[1] ?? '').trim() || lS[0].toUpperCase()),
          country:      lS[2],
          longitude:    lS[5]!,
          latitude:     lS[6]!,
          altitude:     lS[7]!,
          velocity:     lS[9] ?? 0,
          heading:      lS[10] ?? 0,
          verticalRate: lS[11] ?? 0,
          squawk:       (lS[14] ?? '').trim(),
        }))

      mPlanes.value = lPlanes
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: lPlanes }))
    } catch (lErr: unknown) {
      mError.value = lErr instanceof Error ? lErr.message : 'Erreur inconnue'
      console.warn('[usePlanes] Erreur récupération avions :', mError.value)
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
