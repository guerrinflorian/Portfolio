// Auteur : GUERRINF - Florian Guerrin
// Store Pinia - météo temps réel via Open-Meteo

import { defineStore } from 'pinia'
import type {
  WeatherState,
  WeatherStoreState,
  TimeOfDay,
  Season,
  OpenMeteoResponse,
  WmoMapping,
} from '~/types/weather'

// ─── Constantes ───────────────────────────────────────────────────────────────

const LATITUDE = 49.4167
const LONGITUDE = 6.0000
const TIMEZONE = 'Europe/Paris'
const REFRESH_INTERVAL_MS = 10 * 60 * 1000 // 10 minutes

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

/**
 * Calcule l'heure de la journée selon l'heure locale et le mois.
 * Les horaires d'aube/coucher varient selon la saison.
 */
function computeTimeOfDay(pHour: number, pMonth: number): TimeOfDay {
  // Heures de lever/coucher approximatives selon le mois (hémisphère nord)
  const calcRise = pMonth >= 4 && pMonth <= 9 ? 6 : 7
  const calcSet  = pMonth >= 4 && pMonth <= 9 ? 20 : 17

  if (pHour < calcRise - 0.5) return 'night'
  if (pHour < calcRise + 0.5) return 'dawn'
  if (pHour < 10)             return 'morning'
  if (pHour < 14)             return 'noon'
  if (pHour < calcSet - 1)    return 'afternoon'
  if (pHour < calcSet + 0.5)  return 'dusk'
  return 'night'
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
     */
    async fetchWeather(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        const lUrl = new URL('https://api.open-meteo.com/v1/forecast')
        lUrl.searchParams.set('latitude', String(LATITUDE))
        lUrl.searchParams.set('longitude', String(LONGITUDE))
        lUrl.searchParams.set(
          'current',
          'temperature_2m,weathercode,is_day,precipitation,snowfall,windspeed_10m'
        )
        lUrl.searchParams.set('timezone', TIMEZONE)

        const lResponse = await fetch(lUrl.toString())
        if (!lResponse.ok) {
          throw new Error(`Erreur API Open-Meteo : ${lResponse.status}`)
        }

        const lData: OpenMeteoResponse = await lResponse.json() as OpenMeteoResponse
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
      this.isDay     = lHour >= 7 && lHour < 20
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
