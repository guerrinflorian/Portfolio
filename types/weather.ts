// Auteur : GUERRINF - Florian Guerrin
// Types pour le système météo - Open-Meteo API

// ─── États visuels météo ──────────────────────────────────────────────────────

export type WeatherState =
  | 'clear'
  | 'cloudy'
  | 'overcast'
  | 'rain'
  | 'snow'
  | 'storm'
  | 'fog'

// ─── Heure de la journée ──────────────────────────────────────────────────────

export type TimeOfDay =
  | 'dawn'
  | 'morning'
  | 'noon'
  | 'afternoon'
  | 'dusk'
  | 'night'

// ─── Saisons ──────────────────────────────────────────────────────────────────

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

// ─── Réponse brute Open-Meteo ─────────────────────────────────────────────────

export interface OpenMeteoCurrentUnits {
  time: string
  interval: string
  temperature_2m: string
  weathercode: string
  is_day: string
  precipitation: string
  snowfall: string
  windspeed_10m: string
}

export interface OpenMeteoCurrent {
  time: string
  interval: number
  temperature_2m: number
  weathercode: number
  is_day: number       // 0 = nuit, 1 = jour
  precipitation: number
  snowfall: number
  windspeed_10m: number
}

export interface OpenMeteoDaily {
  time: string[]
  temperature_2m_max: number[]
  temperature_2m_min: number[]
  precipitation_sum: number[]
  sunrise: string[]
  sunset: string[]
}

export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  generationtime_ms: number
  utc_offset_seconds: number
  timezone: string
  timezone_abbreviation: string
  elevation: number
  current_units: OpenMeteoCurrentUnits
  current: OpenMeteoCurrent
  daily?: OpenMeteoDaily
}

// ─── Store Pinia météo ────────────────────────────────────────────────────────

export interface WeatherStoreState {
  state: WeatherState
  isDay: boolean
  temperature: number
  windSpeed: number        // km/h → intensité du vent sur l'arbre
  precipitation: number    // mm → intensité pluie/neige
  tempMax: number | null
  tempMin: number | null
  precipitationSum: number | null
  sunrise: string | null   // format "HH:MM"
  sunset: string | null    // format "HH:MM"
  timeOfDay: TimeOfDay
  season: Season
  loading: boolean
  lastFetch: Date | null
  error: string | null
}

// ─── Mapping WMO weathercode → WeatherState ───────────────────────────────────

export interface WmoMapping {
  [code: number]: WeatherState
}
