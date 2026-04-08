<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - indicateur météo discret (coin haut droit)

import { computed } from 'vue'
import { useWeatherStore } from '~/stores/weather'
import { useLocale } from '~/composables/useLocale'
import type { WeatherState } from '~/types/weather'

const mWeatherStore = useWeatherStore()

const { t } = useLocale()

const mTemperature = computed(() => mWeatherStore.temperature)
const mState   = computed(() => mWeatherStore.state)
const mLoading = computed(() => mWeatherStore.loading)

// ─── Icônes SVG inline selon état météo ──────────────────────────────────────

interface WeatherIcon {
  path: string
  viewBox: string
  stroke?: string
  fill?: string
}

const mIcons: Record<WeatherState, WeatherIcon> = {
  clear: {
    viewBox: '0 0 24 24',
    path: 'M12 3v1M12 20v1M4.22 4.22l.707.707M18.364 18.364l.707.707M3 12h1M20 12h1M4.927 19.073l.707-.707M18.364 5.636l.707-.707M12 7a5 5 0 100 10A5 5 0 0012 7z',
    stroke: '#FFD700',
    fill: 'none',
  },
  cloudy: {
    viewBox: '0 0 24 24',
    path: 'M18 10a6 6 0 00-11.83-1.18A4 4 0 106 18h12a4 4 0 000-8z',
    stroke: 'currentColor',
    fill: 'none',
  },
  overcast: {
    viewBox: '0 0 24 24',
    path: 'M18 10a6 6 0 00-11.83-1.18A4 4 0 106 18h12a4 4 0 000-8zM3 20h18',
    stroke: 'currentColor',
    fill: 'none',
  },
  rain: {
    viewBox: '0 0 24 24',
    path: 'M18 10a6 6 0 00-11.83-1.18A4 4 0 106 18h12a4 4 0 000-8zM8 22l1-3M12 22l1-3M16 22l1-3',
    stroke: '#60a5fa',
    fill: 'none',
  },
  snow: {
    viewBox: '0 0 24 24',
    path: 'M18 10a6 6 0 00-11.83-1.18A4 4 0 106 18h12a4 4 0 000-8zM8 22l.5-1.5M12 22l.5-1.5M16 22l.5-1.5',
    stroke: '#bfdbfe',
    fill: 'none',
  },
  storm: {
    viewBox: '0 0 24 24',
    path: 'M18 10a6 6 0 00-11.83-1.18A4 4 0 106 18h12a4 4 0 000-8zM13 14l-3 5h5l-3 5',
    stroke: '#fbbf24',
    fill: 'none',
  },
  fog: {
    viewBox: '0 0 24 24',
    path: 'M3 10h18M5 14h14M7 18h10',
    stroke: 'currentColor',
    fill: 'none',
  },
}

const mCurrentIcon = computed(() => mIcons[mState.value])
</script>

<template>
  <div
    class="weather-indicator"
    :class="{ 'opacity-50': mLoading }"
    role="status"
    :aria-label="t(`Météo à Tressange : ${mTemperature}°C`, `Weather in Tressange: ${mTemperature}°C`)"
    aria-live="polite"
  >
    <!-- Icône SVG -->
    <svg
      width="16"
      height="16"
      :viewBox="mCurrentIcon.viewBox"
      :stroke="mCurrentIcon.stroke ?? 'currentColor'"
      :fill="mCurrentIcon.fill ?? 'none'"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path :d="mCurrentIcon.path" />
    </svg>

    <!-- Température -->
    <span
      class="weather-temp"
      aria-label="Température"
    >
      <span v-if="mLoading">-</span>
      <span v-else>{{ mTemperature }}°C</span>
    </span>

    <!-- Séparateur -->
    <span class="weather-separator" aria-hidden="true">·</span>

    <!-- Localisation -->
    <span class="weather-city">{{ t('Tressange', 'Tressange, FR') }}</span>
  </div>
</template>

<style scoped>
.weather-temp {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.weather-separator {
  opacity: 0.4;
  margin: 0 0.1rem;
}

.weather-city {
  opacity: 0.8;
  font-size: 0.78rem;
}
</style>
