// Auteur : GUERRINF - Florian Guerrin
// Store Pinia - état de la scène (thème, couleurs ciel, ambiance)

import { defineStore } from 'pinia'
import type { WeatherState, TimeOfDay, Season } from '~/types/weather'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SkyPalette {
  top: string
  bottom: string
}

export interface GroundColors {
  primary: string
  secondary: string
  snow: boolean
}

export interface SceneTheme {
  skyPalette: SkyPalette
  groundColors: GroundColors
  ambientLight: string
  modalBg: string
  modalBorder: string
  modalText: string
  isDark: boolean
}

export interface SceneStoreState {
  theme: SceneTheme
  currentWeather: WeatherState
  currentTimeOfDay: TimeOfDay
  currentSeason: Season
}

// ─── Palettes ciel selon état météo/heure ─────────────────────────────────────

const SKY_PALETTES: Record<string, SkyPalette> = {
  night_clear:  { top: '#050510', bottom: '#0d0d2e' },
  night_cloudy: { top: '#0a0a1a', bottom: '#1a1a3a' },
  dawn_clear:   { top: '#ff6b35', bottom: '#ffd700' },
  dawn_cloudy:  { top: '#d4632a', bottom: '#c4a44a' },
  day_clear:    { top: '#1e90ff', bottom: '#87ceeb' },
  day_cloudy:   { top: '#5a7a9a', bottom: '#8aabb0' },
  day_overcast: { top: '#4a6a8a', bottom: '#7a9aaa' },
  day_fog:      { top: '#8a9aaa', bottom: '#b0c0cc' },
  day_rain:     { top: '#3a5a7a', bottom: '#5a7a8a' },
  day_snow:     { top: '#6a8aaa', bottom: '#b0c8d8' },
  day_storm:    { top: '#1a2a3a', bottom: '#2a3a4a' },
  dusk_clear:   { top: '#ff4500', bottom: '#ff8c00' },
  dusk_cloudy:  { top: '#b03020', bottom: '#c06030' },
}

// ─── Couleurs du sol selon saison ─────────────────────────────────────────────

const GROUND_COLORS: Record<Season, GroundColors> = {
  spring: { primary: '#5a9e3a', secondary: '#7bc451', snow: false },
  summer: { primary: '#3a8a20', secondary: '#5aaa40', snow: false },
  autumn: { primary: '#8a6a20', secondary: '#b08a40', snow: false },
  winter: { primary: '#c8d8e8', secondary: '#dce8f0', snow: true  },
}

// ─── Fonctions utilitaires ────────────────────────────────────────────────────

function computeSkyPalette(pTimeOfDay: TimeOfDay, pWeather: WeatherState, pIsDay: boolean): SkyPalette {
  if (!pIsDay || pTimeOfDay === 'night') {
    const lKey = pWeather === 'clear' ? 'night_clear' : 'night_cloudy'
    return SKY_PALETTES[lKey] ?? SKY_PALETTES['night_clear']!
  }
  if (pTimeOfDay === 'dawn') {
    const lKey = pWeather === 'clear' ? 'dawn_clear' : 'dawn_cloudy'
    return SKY_PALETTES[lKey] ?? SKY_PALETTES['dawn_clear']!
  }
  if (pTimeOfDay === 'dusk') {
    const lKey = pWeather === 'clear' ? 'dusk_clear' : 'dusk_cloudy'
    return SKY_PALETTES[lKey] ?? SKY_PALETTES['dusk_clear']!
  }
  // Journée normale
  const lKey = `day_${pWeather}`
  return SKY_PALETTES[lKey] ?? SKY_PALETTES['day_clear']!
}

function buildTheme(pTimeOfDay: TimeOfDay, pWeather: WeatherState, pSeason: Season, pIsDay: boolean): SceneTheme {
  const lIsNight = !pIsDay || pTimeOfDay === 'night'

  let lAmbient = 'rgba(255, 255, 220, 0.15)'
  if (pTimeOfDay === 'dawn')      lAmbient = 'rgba(255, 150, 80, 0.2)'
  else if (pTimeOfDay === 'dusk') lAmbient = 'rgba(255, 100, 50, 0.2)'
  else if (lIsNight)              lAmbient = 'rgba(50, 80, 180, 0.1)'
  else if (pWeather === 'storm')  lAmbient = 'rgba(100, 100, 150, 0.1)'

  return {
    skyPalette:   computeSkyPalette(pTimeOfDay, pWeather, pIsDay),
    groundColors: GROUND_COLORS[pSeason],
    ambientLight: lAmbient,
    modalBg:      lIsNight ? '#1a1a2e' : '#ffffff',
    modalBorder:  lIsNight ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.1)',
    modalText:    lIsNight ? '#e8e8f0' : '#1a1a2e',
    isDark:       lIsNight,
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSceneStore = defineStore('scene', {
  state: (): SceneStoreState => ({
    theme: buildTheme('morning', 'clear', 'spring', true),
    currentWeather: 'clear',
    currentTimeOfDay: 'morning',
    currentSeason: 'spring',
  }),

  getters: {
    skyTop:    (state): string  => state.theme.skyPalette.top,
    skyBottom: (state): string  => state.theme.skyPalette.bottom,
    isDark:    (state): boolean => state.theme.isDark,
  },

  actions: {
    /**
     * Met à jour le thème de la scène selon les conditions météo et l'heure.
     */
    updateTheme(pTimeOfDay: TimeOfDay, pWeather: WeatherState, pSeason: Season, pIsDay: boolean): void {
      this.currentWeather   = pWeather
      this.currentTimeOfDay = pTimeOfDay
      this.currentSeason    = pSeason
      this.theme            = buildTheme(pTimeOfDay, pWeather, pSeason, pIsDay)
    },
  },
})
