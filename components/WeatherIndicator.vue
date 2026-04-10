<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - indicateur météo discret (coin haut droit)

import { computed, ref } from 'vue'
import { useWeatherStore } from '~/stores/weather'
import { useLocale } from '~/composables/useLocale'
import type { WeatherState } from '~/types/weather'

const mWeatherStore = useWeatherStore()

const { t } = useLocale()

const mTemperature    = computed(() => mWeatherStore.temperature)
const mState          = computed(() => mWeatherStore.state)
const mLoading        = computed(() => mWeatherStore.loading)
const mWindSpeed      = computed(() => mWeatherStore.windSpeed)
const mTempMax        = computed(() => mWeatherStore.tempMax)
const mTempMin        = computed(() => mWeatherStore.tempMin)
const mPrecipSum      = computed(() => mWeatherStore.precipitationSum)
const mSunrise        = computed(() => mWeatherStore.sunrise)
const mSunset         = computed(() => mWeatherStore.sunset)

const mHovered  = ref(false)
const mPinned   = ref(false) // maintenu ouvert au tap mobile

function onMouseEnter() { mHovered.value = true }
function onMouseLeave() { if (!mPinned.value) mHovered.value = false }
function onToggle() {
  mPinned.value  = !mPinned.value
  mHovered.value = mPinned.value
}

// Ferme si on clique ailleurs
if (import.meta.client) {
  document.addEventListener('click', (lEvt) => {
    const lEl = document.querySelector('.weather-wrapper')
    if (lEl && !lEl.contains(lEvt.target as Node)) {
      mPinned.value  = false
      mHovered.value = false
    }
  })
}

const mStateLabel: Record<WeatherState, [string, string]> = {
  clear:    ['Ciel dégagé',  'Clear sky'],
  cloudy:   ['Nuageux',      'Cloudy'],
  overcast: ['Couvert',      'Overcast'],
  rain:     ['Pluie',        'Rain'],
  snow:     ['Neige',        'Snow'],
  storm:    ['Orage',        'Storm'],
  fog:      ['Brouillard',   'Fog'],
}

const mLabel = computed(() => {
  const lPair = mStateLabel[mState.value]
  return t(lPair[0], lPair[1])
})

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
    class="weather-wrapper"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @click="onToggle"
  >
    <div
      class="weather-indicator"
      :class="{ 'opacity-50': mLoading }"
      role="status"
      :aria-label="t(`Météo à Bure / Tressange : ${mTemperature}°C`, `Weather in Bure / Tressange: ${mTemperature}°C`)"
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
      <span class="weather-temp" aria-label="Température">
        <span v-if="mLoading">-</span>
        <span v-else>{{ mTemperature }}°C</span>
      </span>

      <!-- Séparateur -->
      <span class="weather-separator" aria-hidden="true">·</span>

      <!-- Localisation -->
      <span class="weather-city">{{ t('Bure / Tressange', 'Bure / Tressange') }}</span>
    </div>

    <!-- Tooltip -->
    <Transition name="weather-tooltip-fade">
      <div v-if="mHovered && !mLoading" class="weather-tooltip" role="tooltip">
        <!-- En-tête : état -->
        <div class="wt-header">
          <svg
            width="13"
            height="13"
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
          <span class="wt-state">{{ mLabel }}</span>
          <span class="wt-location">Bure / Tressange</span>
        </div>

        <div class="wt-divider" />

        <!-- Température actuelle + max/min -->
        <div class="wt-row">
          <span class="wt-lbl">{{ t('Actuelle', 'Now') }}</span>
          <span class="wt-val">{{ mTemperature }}°C</span>
        </div>
        <div v-if="mTempMax !== null || mTempMin !== null" class="wt-row">
          <span class="wt-lbl">{{ t('Max / Min', 'High / Low') }}</span>
          <span class="wt-val">
            <span class="wt-max">{{ mTempMax !== null ? `${mTempMax}°` : '-' }}</span>
            <span class="wt-sep"> / </span>
            <span class="wt-min">{{ mTempMin !== null ? `${mTempMin}°` : '-' }}</span>
          </span>
        </div>

        <!-- Vent -->
        <div class="wt-row">
          <span class="wt-lbl">{{ t('Vent', 'Wind') }}</span>
          <span class="wt-val">{{ mWindSpeed }} km/h</span>
        </div>

        <!-- Précipitations du jour -->
        <div v-if="mPrecipSum !== null" class="wt-row">
          <span class="wt-lbl">{{ t('Préc.', 'Precip.') }}</span>
          <span class="wt-val">{{ mPrecipSum.toFixed(1) }} mm</span>
        </div>

        <div v-if="mSunrise || mSunset" class="wt-divider" />

        <!-- Lever / coucher -->
        <div v-if="mSunrise || mSunset" class="wt-row wt-row--sun">
          <span class="wt-sun-item">
            <span class="wt-sun-icon">↑</span>
            <span>{{ mSunrise ?? '-' }}</span>
          </span>
          <span class="wt-sun-item">
            <span class="wt-sun-icon">↓</span>
            <span>{{ mSunset ?? '-' }}</span>
          </span>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.weather-wrapper {
  position: relative;
  cursor: pointer;
}

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

/* ─── Tooltip ────────────────────────────────────────────────────────────── */

.weather-tooltip {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: rgba(8, 10, 24, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  padding: 10px 13px;
  min-width: 180px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 50;
  pointer-events: none;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
}

.wt-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 2px;
}

.wt-state {
  font-size: 12px;
  font-weight: 600;
  color: #e8eeff;
  flex: 1;
}

.wt-location {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.55);
  white-space: nowrap;
}

.wt-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.07);
  margin: 7px 0;
}

.wt-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 3px;
}

.wt-row:last-child {
  margin-bottom: 0;
}

.wt-lbl {
  color: rgba(148, 163, 184, 0.8);
  width: 52px;
  flex-shrink: 0;
}

.wt-val {
  font-variant-numeric: tabular-nums;
}

.wt-max { color: #fb923c; }
.wt-sep { color: rgba(148, 163, 184, 0.5); }
.wt-min { color: #60a5fa; }

.wt-row--sun {
  gap: 16px;
}

.wt-sun-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
}

.wt-sun-icon {
  color: #fbbf24;
  font-size: 11px;
}

/* Transition */
.weather-tooltip-fade-enter-active,
.weather-tooltip-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.weather-tooltip-fade-enter-from,
.weather-tooltip-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
