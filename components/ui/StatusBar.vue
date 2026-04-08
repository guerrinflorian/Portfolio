<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - barre de statut façon VS Code, en bas de l'écran

import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useWeatherStore } from '~/stores/weather'

const weatherStore = useWeatherStore()

// ─── Horloge en temps réel ────────────────────────────────────────────────────

const mNow = ref(new Date())
let mClockTimer: ReturnType<typeof setInterval> | null = null

const mFormattedDate = computed(() => {
  const lD = mNow.value
  const lY = lD.getFullYear()
  const lM = String(lD.getMonth() + 1).padStart(2, '0')
  const lDay = String(lD.getDate()).padStart(2, '0')
  return `${lY}-${lM}-${lDay}`
})

const mFormattedTime = computed(() => {
  const lD = mNow.value
  const lH = String(lD.getHours()).padStart(2, '0')
  const lMin = String(lD.getMinutes()).padStart(2, '0')
  const lS = String(lD.getSeconds()).padStart(2, '0')
  return `${lH}:${lMin}:${lS}`
})

// ─── Libellé météo ────────────────────────────────────────────────────────────

const WEATHER_LABELS: Record<string, string> = {
  clear:    'Ensoleillé',
  cloudy:   'Nuageux',
  overcast: 'Couvert',
  rain:     'Pluie',
  snow:     'Neige',
  storm:    'Orage',
  fog:      'Brouillard',
}

const mWeatherLabel = computed(() => WEATHER_LABELS[weatherStore.state] ?? weatherStore.state)
const mTemp         = computed(() => weatherStore.loading ? '-' : `${weatherStore.temperature}°C`)

onMounted(() => {
  mClockTimer = setInterval(() => { mNow.value = new Date() }, 1000)
})

onUnmounted(() => {
  if (mClockTimer !== null) clearInterval(mClockTimer)
})
</script>

<template>
  <div class="status-bar" role="status" aria-label="Barre de statut">

    <!-- Partie gauche : branche git + coordonnées GPS -->
    <div class="status-section status-section--left">
      <!-- Icône git branch -->
      <span class="status-item status-item--branch">
        <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" class="status-icon">
          <path d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z"/>
        </svg>
        main
      </span>

      <!-- GPS + nom : masqués sur mobile -->
      <span class="status-sep status-sep--hide-mobile">·</span>

      <span class="status-item status-item--gps status-item--hide-mobile">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true" class="status-icon">
          <path fill-rule="evenodd" d="M6 1a4 4 0 014 4c0 2.8-4 6.5-4 6.5S2 7.8 2 5a4 4 0 014-4zm0 2a2 2 0 100 4 2 2 0 000-4z" clip-rule="evenodd"/>
        </svg>
        49.3897°N · 6.0731°E
      </span>

      <span class="status-sep status-sep--hide-mobile">·</span>

      <span class="status-item status-item--hide-mobile">Florian Guerrin</span>
    </div>

    <!-- Partie centre : météo en direct (masquée sur mobile, déjà visible via WeatherIndicator) -->
    <div class="status-section status-section--center status-section--hide-mobile">
      <span class="status-item status-item--weather">
        {{ mTemp }} · {{ mWeatherLabel }} · Tressange
      </span>
    </div>

    <!-- Partie droite : stack (masqué mobile) + horloge (toujours visible) -->
    <div class="status-section status-section--right">
      <span class="status-item status-item--stack status-item--hide-tablet">Nuxt 3</span>
      <span class="status-sep status-sep--hide-tablet">·</span>
      <span class="status-item status-item--stack status-item--hide-tablet">TypeScript</span>
      <span class="status-sep status-sep--hide-tablet">·</span>
      <span class="status-item status-item--stack status-item--hide-tablet">Tailwind</span>
      <span class="status-sep status-sep--hide-tablet">·</span>
      <span class="status-item status-item--stack status-item--hide-tablet">GSAP</span>
      <span class="status-sep status-sep--hide-tablet">·</span>
      <span class="status-item status-item--stack status-item--hide-tablet">Pinia</span>
      <span class="status-sep status-sep--hide-tablet">·</span>
      <span class="status-item status-item--clock">
        <span class="status-clock-date">{{ mFormattedDate }} · </span>{{ mFormattedTime }}
      </span>
    </div>

  </div>
</template>

<style scoped>
.status-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 26px;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  background: rgba(0, 0, 0, 0.72);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.7);
  user-select: none;
  pointer-events: none;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.status-section--center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.status-item {
  white-space: nowrap;
  opacity: 0.75;
}

.status-item--branch  { color: #4ade80; opacity: 0.9; }
.status-item--gps     { color: #60a5fa; opacity: 0.85; }
.status-item--weather { color: #fbbf24; opacity: 0.9; }
.status-item--stack   { color: #a78bfa; opacity: 0.9; }
.status-item--clock   {
  font-variant-numeric: tabular-nums;
  color: rgba(255, 255, 255, 0.55);
}

.status-sep {
  opacity: 0.3;
}

.status-icon {
  vertical-align: middle;
  margin-top: -1px;
  display: inline-block;
}

/* ─── Responsive ─────────────────────────────────────────────────────────────── */

/* Tablette : masquer la stack technique, garder horloge + branche + GPS */
@media (max-width: 900px) {
  .status-item--hide-tablet,
  .status-sep--hide-tablet {
    display: none;
  }
}

/* Mobile : ne garder que branche (gauche) + horloge (droite) */
@media (max-width: 639px) {
  .status-bar {
    padding: 0 0.6rem;
  }

  .status-item--hide-mobile,
  .status-sep--hide-mobile,
  .status-section--hide-mobile {
    display: none;
  }

  /* Sur mobile : masquer la date, ne garder que l'heure */
  .status-clock-date {
    display: none;
  }
}
</style>
