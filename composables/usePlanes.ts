// Auteur : GUERRINF - Florian Guerrin
// Composable - avions en temps réel via server route /api/planes (proxy OpenSky)
// État module-level partagé entre les deux instances de ScenePlanes (near/far)

import { ref, reactive, onMounted } from 'vue'
import type { AircraftDetails } from '~/server/api/aircraft/[icao24]'

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
  squawk:       string
}

type OpenSkyStateVector = [
  string, string | null, string,
  number | null, number,
  number | null, number | null, number | null,
  boolean, number, number | null, number | null,
  number[] | null, number | null, string | null, boolean, number
]

interface OpenSkyResponse {
  time:   number
  states: OpenSkyStateVector[] | null
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const REFRESH_MS = 5 * 60_000
const CACHE_KEY  = 'planes_cache'
const CACHE_TTL  = 4.5 * 60_000

// ─── État singleton module-level (partagé entre les instances du composant) ───

const mPlanesShared  = ref<Plane[]>([])
const mDetailsShared = reactive<Record<string, AircraftDetails>>({})
const mLoadingShared = ref(false)
const mErrorShared   = ref<string | null>(null)
let   mInitialized   = false

// ─── Fetch des détails avion (en arrière-plan, par lots de 5) ─────────────────

async function fetchAllDetails(): Promise<void> {
  if (!import.meta.client) return

  const lNew = mPlanesShared.value.filter(lP => !mDetailsShared[lP.icao24])
  if (lNew.length === 0) return

  // Lots de 5 pour ne pas saturer hexdb.io
  for (let lI = 0; lI < lNew.length; lI += 5) {
    const lBatch = lNew.slice(lI, lI + 5)
    await Promise.allSettled(
      lBatch.map(async lP => {
        try {
          const lData = await $fetch<AircraftDetails>(`/api/aircraft/${lP.icao24}`)
          mDetailsShared[lP.icao24] = lData
        } catch { /* silencieux */ }
      })
    )
  }
}

// ─── Fetch des avions ─────────────────────────────────────────────────────────

async function fetchPlanes(): Promise<void> {
  if (!import.meta.client) return
  mLoadingShared.value = true
  mErrorShared.value   = null

  try {
    const lCached = sessionStorage.getItem(CACHE_KEY)
    if (lCached) {
      const lParsed = JSON.parse(lCached) as { ts: number; data: Plane[] }
      if (Date.now() - lParsed.ts < CACHE_TTL) {
        mPlanesShared.value  = lParsed.data
        mLoadingShared.value = false
        void fetchAllDetails()
        return
      }
    }

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

    mPlanesShared.value = lPlanes
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: lPlanes }))

    // Préchargement immédiat des détails → plus de changement de taille au survol
    void fetchAllDetails()
  } catch (lErr: unknown) {
    mErrorShared.value = lErr instanceof Error ? lErr.message : 'Erreur inconnue'
    console.warn('[usePlanes] Erreur :', mErrorShared.value)
  } finally {
    mLoadingShared.value = false
  }
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function usePlanes() {
  onMounted(() => {
    // Un seul interval pour toutes les instances (singleton)
    if (!mInitialized) {
      mInitialized = true
      void fetchPlanes()
      setInterval(() => void fetchPlanes(), REFRESH_MS)
    }
  })

  return {
    mPlanes:  mPlanesShared,
    mDetails: mDetailsShared,
    mLoading: mLoadingShared,
    mError:   mErrorShared,
  }
}
