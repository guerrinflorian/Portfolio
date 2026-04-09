<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - avions en temps réel dans le ciel (OpenSky Network)

import { ref, computed } from 'vue'
import { usePlanes } from '~/composables/usePlanes'
import { useWeatherStore } from '~/stores/weather'
import type { Plane } from '~/composables/usePlanes'

// ─── Stores & données ────────────────────────────────────────────────────────

const mWeatherStore = useWeatherStore()
const { mPlanes } = usePlanes()

// ─── Constantes de mapping géographique → écran ───────────────────────────────

const LON_MIN = 5.0
const LON_MAX = 7.5
const ALT_MIN = 500
const ALT_MAX = 13000

// ─── Avion survolé ────────────────────────────────────────────────────────────

const mHoveredIcao = ref<string | null>(null)

// ─── Fonctions de mapping ─────────────────────────────────────────────────────

function calcPositionStyle(pPlane: Plane): Record<string, string> {
  // Longitude → X : 3% à 97% (marges pour ne pas sortir)
  const lX = 3 + ((pPlane.longitude - LON_MIN) / (LON_MAX - LON_MIN)) * 94
  // Altitude → Y : 70% (bas du ciel) → 5% (zénith)
  const lY = 70 - ((pPlane.altitude - ALT_MIN) / (ALT_MAX - ALT_MIN)) * 65

  return {
    left:       `${Math.max(2, Math.min(97, lX))}%`,
    top:        `${Math.max(4, Math.min(70, lY))}%`,
    transition: 'left 58s linear, top 58s linear',
  }
}

// ─── Utilitaires d'affichage ──────────────────────────────────────────────────

function calcSpeedKmh(pVelocity: number): number {
  return Math.round(pVelocity * 3.6)
}

function calcAltitudeFt(pAltitude: number): number {
  return Math.round(pAltitude * 3.281)
}

function calcVerticalLabel(pRate: number): string {
  if (pRate >  1) return '↑'
  if (pRate < -1) return '↓'
  return '→'
}

// Opacité selon heure : légèrement réduite la nuit (navigation lights simulées)
const mPlaneOpacity = computed(() =>
  mWeatherStore.timeOfDay === 'night' ? 0.65 : 0.92
)
</script>

<template>
  <div aria-hidden="true" class="scene-planes">
    <TransitionGroup name="plane-fade">
      <div
        v-for="lPlane in mPlanes"
        :key="lPlane.icao24"
        class="plane-item"
        :style="calcPositionStyle(lPlane)"
        :class="{ 'is-night': mWeatherStore.timeOfDay === 'night' }"
        @mouseenter="mHoveredIcao = lPlane.icao24"
        @mouseleave="mHoveredIcao = null"
      >
        <!-- Icône avion -->
        <div
          class="plane-icon"
          :style="{
            transform: `rotate(${lPlane.heading}deg)`,
            opacity: String(mPlaneOpacity),
          }"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <!-- Corps de l'avion pointant vers le nord (haut) -->
            <path
              d="M12 2 L14.5 9 L21 11 L14.5 13 L15 20 L12 18.5 L9 20 L9.5 13 L3 11 L9.5 9 Z"
              fill="white"
              opacity="0.92"
            />
          </svg>
          <!-- Feu de navigation la nuit -->
          <span
            v-if="mWeatherStore.timeOfDay === 'night'"
            class="nav-light"
          />
        </div>

        <!-- Callsign label (toujours visible) -->
        <span class="plane-callsign">{{ lPlane.callsign }}</span>

        <!-- Tooltip au survol -->
        <Transition name="tooltip-fade">
          <div v-if="mHoveredIcao === lPlane.icao24" class="plane-tooltip">
            <div class="tooltip-callsign">{{ lPlane.callsign }}</div>
            <div class="tooltip-row">
              <span class="tooltip-label">Alt</span>
              <span>{{ calcAltitudeFt(lPlane.altitude).toLocaleString() }} ft</span>
              <span class="tooltip-sub">({{ Math.round(lPlane.altitude) }} m)</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">Vit</span>
              <span>{{ calcSpeedKmh(lPlane.velocity) }} km/h</span>
            </div>
            <div class="tooltip-row">
              <span class="tooltip-label">Cap</span>
              <span>{{ Math.round(lPlane.heading) }}°</span>
              <span class="tooltip-sub">{{ calcVerticalLabel(lPlane.verticalRate) }}</span>
            </div>
            <div class="tooltip-country">{{ lPlane.country }}</div>
          </div>
        </Transition>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.scene-planes {
  position: fixed;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

/* Plane item - positionné en absolu par JS */
.plane-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: auto;
  cursor: default;
}

/* Icône avion + rotation cap */
.plane-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
  transition: opacity 2s ease;
}

/* Feu de navigation clignotant (nuit) */
.nav-light {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #ff4444;
  animation: blink 1.2s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.1; }
}

/* Label callsign sous l'avion */
.plane-callsign {
  font-size: 9px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.82);
  text-shadow: 0 0 6px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8);
  white-space: nowrap;
  letter-spacing: 0.04em;
  pointer-events: none;
}

/* Tooltip au survol */
.plane-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(10, 12, 28, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 8px 12px;
  min-width: 160px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 10;
  pointer-events: none;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.tooltip-callsign {
  font-size: 12px;
  font-weight: 700;
  color: #e0e7ff;
  margin-bottom: 6px;
  letter-spacing: 0.08em;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 2px;
}

.tooltip-label {
  color: rgba(148, 163, 184, 0.9);
  width: 24px;
  flex-shrink: 0;
}

.tooltip-sub {
  color: rgba(148, 163, 184, 0.7);
  font-size: 9px;
}

.tooltip-country {
  margin-top: 5px;
  font-size: 9px;
  color: rgba(148, 163, 184, 0.65);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 5px;
}

/* Transitions Vue */
.plane-fade-enter-active,
.plane-fade-leave-active {
  transition: opacity 1.5s ease;
}
.plane-fade-enter-from,
.plane-fade-leave-to {
  opacity: 0;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(4px);
}

/* Caché sur mobile (trop petit) */
@media (max-width: 640px) {
  .scene-planes {
    display: none;
  }
}
</style>
