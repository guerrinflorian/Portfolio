// Auteur : GUERRINF - Florian Guerrin
// Store Pinia - météo temps réel via Open-Meteo

import { defineStore } from 'pinia'
import type {
  WeatherState,
  WeatherStoreState,
  TimeOfDay,
  Season,
  OpenMeteoResponse,
  OpenMeteoDaily,
  WmoMapping,
} from '~/types/weather'

// ─── Constantes ───────────────────────────────────────────────────────────────

const REFRESH_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes
const CACHE_KEY = 'weather_cache'
const CACHE_TTL_MS = 15 * 60 * 1000 // 15 minutes

// Mapping WMO weathercode → état visuel
const WMO_MAP: WmoMapping = {
  0: 'clear',
  1: 'cloudy', 2: 'cloudy',
  3: 'overcast',
  45: 'fog', 48: 'fog',
  51: 'rain', 53: 'rain', 55: 'rain', 56: 'rain', 57: 'rain',
  61: 'rain', 63: 'rain', 65: 'rain', 66: 'rain', 67: 'rain',
  71: 'snow', 73: 'snow', 75: 'snow', 77: 'snow',
  80: 'rain', 81: 'rain', 82: 'rain',
  85: 'snow', 86: 'snow',
  95: 'storm', 96: 'storm', 99: 'storm',
}

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

/**
 * Mappe un code WMO vers un état météo visuel.
 * Si le code n'est pas dans le mapping, retourne 'clear'.
 */
function mapWmoCode(pCode: number): WeatherState {
  return (WMO_MAP[pCode] as WeatherState | undefined) ?? 'clear'
}

// Heures de lever et coucher par mois pour Moselle (49.4°N) en heure locale Europe/Paris
// Index 0 = janvier, 11 = décembre
const LEVER_PAR_MOIS  = [8.50, 7.75, 7.00, 7.17, 6.25, 5.67, 5.92, 6.67, 7.50, 8.25, 7.50, 8.25]
const COUCHER_PAR_MOIS = [17.00, 17.83, 18.67, 20.67, 21.33, 21.92, 21.67, 21.00, 19.83, 18.75, 17.25, 16.83]

/**
 * Calcule l'heure de la journée selon l'heure locale et le mois.
 * Les horaires d'aube/coucher sont calibrés par mois pour Moselle.
 */
function computeTimeOfDay(pHour: number, pMonth: number): TimeOfDay {
  const lIdx    = pMonth - 1  // 0-11
  const calcRise = LEVER_PAR_MOIS[lIdx]  ?? 7.5
  const calcSet  = COUCHER_PAR_MOIS[lIdx] ?? 19.5

  if (pHour < calcRise - 0.75) return 'night'
  if (pHour < calcRise + 0.50) return 'dawn'
  if (pHour < 10)              return 'morning'
  if (pHour < 14)              return 'noon'
  if (pHour < calcSet - 1.0)   return 'afternoon'
  if (pHour < calcSet + 0.50)  return 'dusk'
  return 'night'
}

/**
 * Extrait l'heure "HH:MM" depuis une chaîne ISO datetime Open-Meteo ("2026-04-10T06:23").
 */
function calcFormatTime(pDatetime: string | undefined): string | null {
  if (!pDatetime) return null
  const lParts = pDatetime.split('T')
  return lParts[1] ?? null
}

/**
 * Calcule la saison selon le mois (saisons météorologiques).
 */
function computeSeason(pMonth: number): Season {
  if (pMonth >= 3 && pMonth <= 5) return 'spring'
  if (pMonth >= 6 && pMonth <= 8) return 'summer'
  if (pMonth >= 9 && pMonth <= 11) return 'autumn'
  return 'winter'
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWeatherStore = defineStore('weather', {
  state: (): WeatherStoreState => ({
    state: 'clear',
    isDay: true,
    temperature: 15,
    windSpeed: 10,
    precipitation: 0,
    tempMax: null,
    tempMin: null,
    precipitationSum: null,
    sunrise: null,
    sunset: null,
    timeOfDay: 'morning',
    season: 'spring',
    loading: false,
    lastFetch: null,
    error: null,
  }),

  getters: {
    /** Indique si des précipitations sont actives. */
    hasPrecipitation: (state): boolean =>
      state.state === 'rain' || state.state === 'snow' || state.state === 'storm',

    /** Intensité du vent normalisée (0–1) pour les animations. */
    normalizedWindIntensity: (state): number =>
      Math.min(state.windSpeed / 60, 1),
  },

  actions: {
    /**
     * Récupère les données météo depuis l'API Open-Meteo.
     * Utilise le cache localStorage si les données ont moins de 15 minutes.
     */
    async fetchWeather(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        // Lecture du cache localStorage
        if (import.meta.client) {
          const lCached = localStorage.getItem(CACHE_KEY)
          if (lCached) {
            const lParsed = JSON.parse(lCached) as { ts: number; data: OpenMeteoResponse }
            if (Date.now() - lParsed.ts < CACHE_TTL_MS) {
              this.applyWeatherData(lParsed.data)
              this.lastFetch = new Date(lParsed.ts)
              this.loading = false
              return
            }
          }
        }

        const lResponse = await fetch('/api/weather')
        if (!lResponse.ok) {
          throw new Error(`Erreur proxy météo : ${lResponse.status}`)
        }

        const lData: OpenMeteoResponse = await lResponse.json() as OpenMeteoResponse

        // Sauvegarde en cache localStorage
        if (import.meta.client) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: lData }))
        }

        this.applyWeatherData(lData)
        this.lastFetch = new Date()
      } catch (lError: unknown) {
        const lMsg = lError instanceof Error ? lError.message : 'Erreur inconnue'
        this.error = lMsg
        console.warn('[WeatherStore] Impossible de récupérer la météo :', lMsg)
        this.applyDefaults()
      } finally {
        this.loading = false
      }
    },

    /**
     * Applique les données Open-Meteo au store.
     */
    applyWeatherData(pData: OpenMeteoResponse): void {
      const lNow   = new Date()
      const lHour  = lNow.getHours() + lNow.getMinutes() / 60
      const lMonth = lNow.getMonth() + 1 // 1-12

      this.state         = mapWmoCode(pData.current.weathercode)
      this.isDay         = pData.current.is_day === 1
      this.temperature   = Math.round(pData.current.temperature_2m)
      this.windSpeed     = Math.round(pData.current.windspeed_10m)
      this.precipitation = pData.current.precipitation
      this.timeOfDay     = computeTimeOfDay(lHour, lMonth)
      this.season        = computeSeason(lMonth)

      if (pData.daily) {
        this.tempMax          = pData.daily.temperature_2m_max[0] !== undefined ? Math.round(pData.daily.temperature_2m_max[0]) : null
        this.tempMin          = pData.daily.temperature_2m_min[0] !== undefined ? Math.round(pData.daily.temperature_2m_min[0]) : null
        this.precipitationSum = pData.daily.precipitation_sum[0] !== undefined ? pData.daily.precipitation_sum[0] : null
        this.sunrise          = calcFormatTime(pData.daily.sunrise[0])
        this.sunset           = calcFormatTime(pData.daily.sunset[0])
      }
    },

    /**
     * Valeurs par défaut si l'API est indisponible.
     */
    applyDefaults(): void {
      const lNow   = new Date()
      const lHour  = lNow.getHours() + lNow.getMinutes() / 60
      const lMonth = lNow.getMonth() + 1

      this.timeOfDay = computeTimeOfDay(lHour, lMonth)
      this.season    = computeSeason(lMonth)
      const lIdx     = lMonth - 1
      this.isDay     = lHour >= (LEVER_PAR_MOIS[lIdx] ?? 7.5) && lHour < (COUCHER_PAR_MOIS[lIdx] ?? 19.5)
    },

    /**
     * Démarre le rafraîchissement automatique toutes les 10 minutes.
     * Retourne la fonction d'arrêt.
     */
    startAutoRefresh(): () => void {
      void this.fetchWeather()
      const lIntervalId = setInterval(() => void this.fetchWeather(), REFRESH_INTERVAL_MS)
      return () => clearInterval(lIntervalId)
    },
  },
})
