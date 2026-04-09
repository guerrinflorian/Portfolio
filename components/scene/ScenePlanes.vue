<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - avions en temps réel dans le ciel (OpenSky Network)

import { ref, computed } from 'vue'
import { usePlanes } from '~/composables/usePlanes'
import { useWeatherStore } from '~/stores/weather'
import type { Plane } from '~/composables/usePlanes'
import type { AircraftDetails } from '~/server/api/aircraft/[icao24]'

// ─── Stores & données ────────────────────────────────────────────────────────

const mWeatherStore = useWeatherStore()
const { mPlanes } = usePlanes()

// ─── Constantes de mapping géographique → écran ───────────────────────────────

const LON_MIN = 5.0
const LON_MAX = 7.5
const ALT_MIN = 500
const ALT_MAX = 13000

// Coordonnées de Bure pour le calcul de distance
const BURE_LAT = 49.3500
const BURE_LON = 5.9500

// ─── Détails avion enrichis (chargés au survol) ───────────────────────────────

const mHoveredIcao   = ref<string | null>(null)
const mDetailsCache  = new Map<string, AircraftDetails>()
const mDetailsLoading = ref(false)
const mHoveredDetails = ref<AircraftDetails | null>(null)

async function onHover(pPlane: Plane): Promise<void> {
  console.log('[ScenePlanes] hover →', pPlane.icao24, pPlane.callsign)
  mHoveredIcao.value    = pPlane.icao24
  mHoveredDetails.value = null

  if (mDetailsCache.has(pPlane.icao24)) {
    console.log('[ScenePlanes] cache hit →', mDetailsCache.get(pPlane.icao24))
    mHoveredDetails.value = mDetailsCache.get(pPlane.icao24)!
    return
  }

  mDetailsLoading.value = true
  try {
    console.log('[ScenePlanes] fetch /api/aircraft/', pPlane.icao24)
    const lData = await $fetch<AircraftDetails>(`/api/aircraft/${pPlane.icao24}`)
    console.log('[ScenePlanes] réponse →', lData)
    mDetailsCache.set(pPlane.icao24, lData)
    if (mHoveredIcao.value === pPlane.icao24) mHoveredDetails.value = lData
  } catch (lErr) {
    console.error('[ScenePlanes] erreur fetch détails →', lErr)
  } finally {
    mDetailsLoading.value = false
  }
}

function onLeave(): void {
  mHoveredIcao.value    = null
  mHoveredDetails.value = null
}

// ─── Fonctions de mapping ─────────────────────────────────────────────────────

function calcPlaneY(pPlane: Plane): number {
  const lY = 70 - ((pPlane.altitude - ALT_MIN) / (ALT_MAX - ALT_MIN)) * 65
  return Math.max(4, Math.min(70, lY))
}

function calcPositionStyle(pPlane: Plane): Record<string, string> {
  const lX = 3 + ((pPlane.longitude - LON_MIN) / (LON_MAX - LON_MIN)) * 94

  return {
    left:       `${Math.max(2, Math.min(97, lX))}%`,
    top:        `${calcPlaneY(pPlane)}%`,
    transition: 'left 58s linear, top 58s linear',
  }
}

// Tooltip vers le bas si l'avion est dans le quart supérieur de l'écran
function calcTooltipFlipped(pPlane: Plane): boolean {
  return calcPlaneY(pPlane) < 22
}

// ─── Utilitaires d'affichage ──────────────────────────────────────────────────

function calcSpeedKmh(pVelocity: number): number {
  return Math.round(pVelocity * 3.6)
}

function calcAltitudeFt(pAltitude: number): number {
  return Math.round(pAltitude * 3.281)
}

function calcVerticalLabel(pRate: number): string {
  if (pRate >  2) return '↑'
  if (pRate < -2) return '↓'
  return '→'
}

// Distance de Bure en km (formule haversine simplifiée)
function calcDistanceBure(pLat: number, pLon: number): number {
  const lDlat = (pLat - BURE_LAT) * Math.PI / 180
  const lDlon = (pLon - BURE_LON) * Math.PI / 180
  const lA =
    Math.sin(lDlat / 2) ** 2 +
    Math.cos(BURE_LAT * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) * Math.sin(lDlon / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(lA), Math.sqrt(1 - lA)))
}

// Squawk : détecte les codes d'urgence
function calcSquawkLabel(pSquawk: string): { label: string; emergency: boolean } {
  if (pSquawk === '7700') return { label: '7700 URGENCE', emergency: true }
  if (pSquawk === '7600') return { label: '7600 RADIO', emergency: true }
  if (pSquawk === '7500') return { label: '7500 DETOURNEMENT', emergency: true }
  return { label: pSquawk || '----', emergency: false }
}

// Opacité selon heure : légèrement réduite la nuit
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
        @mouseenter="onHover(lPlane)"
        @mouseleave="onLeave"
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
            <path
              d="M12 2 L14.5 9 L21 11 L14.5 13 L15 20 L12 18.5 L9 20 L9.5 13 L3 11 L9.5 9 Z"
              fill="white"
              opacity="0.92"
            />
          </svg>
          <!-- Feu de navigation clignotant (nuit) -->
          <span v-if="mWeatherStore.timeOfDay === 'night'" class="nav-light" />
        </div>

        <!-- Callsign sous l'avion -->
        <span class="plane-callsign">{{ lPlane.callsign }}</span>

        <!-- Tooltip au survol -->
        <Transition name="tooltip-fade">
          <div
            v-if="mHoveredIcao === lPlane.icao24"
            class="plane-tooltip"
            :class="{ 'plane-tooltip--below': calcTooltipFlipped(lPlane) }"
          >

            <!-- En-tête : callsign + immatriculation -->
            <div class="tooltip-header">
              <span class="tooltip-callsign">{{ lPlane.callsign }}</span>
              <span v-if="mHoveredDetails?.registration" class="tooltip-reg">
                {{ mHoveredDetails.registration }}
              </span>
            </div>

            <!-- Type avion + opérateur (chargé dynamiquement) -->
            <div v-if="mHoveredDetails?.type || mHoveredDetails?.manufacturer" class="tooltip-aircraft">
              <span v-if="mHoveredDetails.manufacturer">{{ mHoveredDetails.manufacturer }}</span>
              <span v-if="mHoveredDetails.type" class="tooltip-type"> {{ mHoveredDetails.type }}</span>
            </div>
            <div v-if="mHoveredDetails?.operator" class="tooltip-operator">
              {{ mHoveredDetails.operator }}
            </div>
            <div v-else-if="mDetailsLoading" class="tooltip-loading">chargement...</div>

            <div class="tooltip-divider" />

            <!-- Altitude -->
            <div class="tooltip-row">
              <span class="tooltip-label">Alt</span>
              <span>{{ calcAltitudeFt(lPlane.altitude).toLocaleString() }} ft</span>
              <span class="tooltip-sub">({{ Math.round(lPlane.altitude) }} m)</span>
            </div>

            <!-- Vitesse -->
            <div class="tooltip-row">
              <span class="tooltip-label">Vit</span>
              <span>{{ calcSpeedKmh(lPlane.velocity) }} km/h</span>
              <span class="tooltip-sub">{{ calcVerticalLabel(lPlane.verticalRate) }}</span>
            </div>

            <!-- Cap -->
            <div class="tooltip-row">
              <span class="tooltip-label">Cap</span>
              <span>{{ Math.round(lPlane.heading) }}°</span>
            </div>

            <!-- Distance depuis Bure -->
            <div class="tooltip-row">
              <span class="tooltip-label">Dist</span>
              <span>{{ calcDistanceBure(lPlane.latitude, lPlane.longitude) }} km de Bure</span>
            </div>

            <!-- Squawk -->
            <div
              class="tooltip-row"
              :class="{ 'tooltip-emergency': calcSquawkLabel(lPlane.squawk).emergency }"
            >
              <span class="tooltip-label">Sqk</span>
              <span>{{ calcSquawkLabel(lPlane.squawk).label }}</span>
            </div>

            <!-- Pays d'immatriculation -->
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
  z-index: 5;  /* au-dessus de TreeCanvas (z-index: 4) */
  pointer-events: none;
}

.plane-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  pointer-events: auto;
  cursor: default;
}

.plane-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  filter: drop-shadow(0 0 4px rgba(255, 255, 255, 0.6));
  transition: opacity 2s ease;
}

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

/* ─── Tooltip ─────────────────────────────────────────────────────────────── */

.plane-tooltip {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
}

.plane-tooltip--below {
  bottom: auto;
  top: calc(100% + 8px);
  background: rgba(10, 12, 28, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  padding: 10px 13px;
  min-width: 190px;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  z-index: 10;
  pointer-events: none;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
}

.tooltip-header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 2px;
}

.tooltip-callsign {
  font-size: 13px;
  font-weight: 700;
  color: #e0e7ff;
  letter-spacing: 0.08em;
}

.tooltip-reg {
  font-size: 10px;
  color: rgba(148, 163, 184, 0.85);
}

.tooltip-aircraft {
  font-size: 10px;
  color: rgba(99, 179, 237, 0.9);
  margin-bottom: 1px;
}

.tooltip-type {
  font-weight: 600;
}

.tooltip-operator {
  font-size: 9px;
  color: rgba(167, 243, 208, 0.85);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.tooltip-loading {
  font-size: 9px;
  color: rgba(148, 163, 184, 0.5);
  margin-bottom: 4px;
  font-style: italic;
}

.tooltip-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin: 6px 0;
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
  width: 28px;
  flex-shrink: 0;
}

.tooltip-sub {
  color: rgba(148, 163, 184, 0.7);
  font-size: 9px;
}

.tooltip-emergency {
  color: #ff6b6b;
  font-weight: 700;
  animation: pulse-red 1s ease-in-out infinite;
}

@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

.tooltip-country {
  margin-top: 5px;
  font-size: 9px;
  color: rgba(148, 163, 184, 0.55);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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

.plane-tooltip--below.tooltip-fade-enter-from,
.plane-tooltip--below.tooltip-fade-leave-to {
  transform: translateX(-50%) translateY(-4px);
}

@media (max-width: 640px) {
  .scene-planes { display: none; }
}
</style>
