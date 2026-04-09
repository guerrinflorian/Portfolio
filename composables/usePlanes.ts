// Auteur : GUERRINF - Florian Guerrin
// Composable - avions en temps réel via server route /api/planes (proxy airplanes.live)
// Etat module-level partage entre les instances de ScenePlanes

import { ref, reactive, onMounted } from 'vue'
import type { AircraftDetails } from '~/server/api/aircraft/[icao24]'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Plane {
  icao24:       string
  callsign:     string
  country:      string
  longitude:    number
  latitude:     number
  altitude:     number    // metres (baro)
  velocity:     number    // m/s
  heading:      number    // degres, sens horaire depuis le nord
  verticalRate: number    // m/s (positif = montee)
  squawk:       string
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const REFRESH_MS = 5 * 60_000
const CACHE_KEY  = 'planes_cache_v2'
const CACHE_TTL  = 4.5 * 60_000

// ─── Etat singleton module-level ─────────────────────────────────────────────

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
    // Cache sessionStorage
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

    // Le serveur retourne directement Plane[]
    const lPlanes = await $fetch<Plane[]>('/api/planes')

    mPlanesShared.value = lPlanes
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: lPlanes }))
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
