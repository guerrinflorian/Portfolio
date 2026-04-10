<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - avions en temps réel (OpenSky) - couche unique z-index 2
// Profondeur visuelle uniquement via scale/opacité selon distance

import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { CSSProperties } from 'vue'
import { usePlanes } from '~/composables/usePlanes'
import { useWeatherStore } from '~/stores/weather'
import type { Plane } from '~/composables/usePlanes'

// ─── Stores & données ─────────────────────────────────────────────────────────

const mWeatherStore = useWeatherStore()
const { mPlanes, mDetails } = usePlanes()

// ─── Constantes géographiques ─────────────────────────────────────────────────

const LON_MIN  = 5.0
const LON_MAX  = 7.5
const ALT_MIN  = 500
const ALT_MAX  = 13000
const BURE_LAT = 49.3500
const BURE_LON = 5.9500
const MAX_KM   = 60   // rayon maximal autour de Bure - au-delà on ignore

// ─── Mapping pays → ISO 3166-1 alpha-2 ────────────────────────────────────────

const COUNTRY_TO_ISO: Record<string, string> = {
  'Albania': 'al', 'Andorra': 'ad', 'Armenia': 'am', 'Austria': 'at',
  'Azerbaijan': 'az', 'Belarus': 'by', 'Belgium': 'be', 'Bosnia and Herzegovina': 'ba',
  'Bulgaria': 'bg', 'Croatia': 'hr', 'Cyprus': 'cy', 'Czech Republic': 'cz',
  'Denmark': 'dk', 'Estonia': 'ee', 'Finland': 'fi', 'France': 'fr',
  'Georgia': 'ge', 'Germany': 'de', 'Gibraltar': 'gi', 'Greece': 'gr',
  'Hungary': 'hu', 'Iceland': 'is', 'Ireland': 'ie', 'Israel': 'il',
  'Italy': 'it', 'Kazakhstan': 'kz', 'Kosovo': 'xk', 'Latvia': 'lv',
  'Liechtenstein': 'li', 'Lithuania': 'lt', 'Luxembourg': 'lu', 'Malta': 'mt',
  'Moldova': 'md', 'Monaco': 'mc', 'Montenegro': 'me', 'Morocco': 'ma',
  'Netherlands': 'nl', 'North Macedonia': 'mk', 'Norway': 'no', 'Poland': 'pl',
  'Portugal': 'pt', 'Romania': 'ro', 'Russia': 'ru', 'San Marino': 'sm',
  'Serbia': 'rs', 'Slovakia': 'sk', 'Slovenia': 'si', 'Spain': 'es',
  'Sweden': 'se', 'Switzerland': 'ch', 'Turkey': 'tr', 'Ukraine': 'ua',
  'United Kingdom': 'gb', 'Uzbekistan': 'uz',
  'Argentina': 'ar', 'Australia': 'au', 'Bahrain': 'bh', 'Brazil': 'br',
  'Canada': 'ca', 'Chile': 'cl', 'China': 'cn', 'Colombia': 'co',
  'Egypt': 'eg', 'Ethiopia': 'et', 'Ghana': 'gh', 'Hong Kong': 'hk',
  'India': 'in', 'Indonesia': 'id', 'Iran': 'ir', 'Iraq': 'iq',
  'Japan': 'jp', 'Jordan': 'jo', 'Kenya': 'ke', 'Kuwait': 'kw',
  'Malaysia': 'my', 'Mexico': 'mx', 'New Zealand': 'nz', 'Nigeria': 'ng',
  'Pakistan': 'pk', 'Peru': 'pe', 'Qatar': 'qa', 'Saudi Arabia': 'sa',
  'Singapore': 'sg', 'South Africa': 'za', 'South Korea': 'kr',
  'Taiwan': 'tw', 'Thailand': 'th', 'Tunisia': 'tn',
  'United Arab Emirates': 'ae', 'United States': 'us',
}

const COUNTRY_COLORS: Record<string, string> = {
  'fr': '#4A7FE5', 'de': '#E8C040', 'gb': '#CF2B2B', 'nl': '#CF2B2B',
  'be': '#E8C040', 'lu': '#5BBAE8', 'ch': '#CF2B2B', 'at': '#CF2B2B',
  'es': '#E8A030', 'it': '#5DB86A', 'pt': '#4A8A4A', 'ie': '#5DB86A',
  'dk': '#CF2B2B', 'se': '#4A7FE5', 'no': '#CF2B2B', 'fi': '#4A7FE5',
  'pl': '#CF2B2B', 'cz': '#CF2B2B', 'hu': '#CF2B2B', 'ro': '#4A7FE5',
  'ru': '#4A7FE5', 'tr': '#CF2B2B', 'gr': '#4A7FE5', 'us': '#4A6FD4',
  'ca': '#CF2B2B', 'ae': '#5DB86A', 'qa': '#8A3060', 'sg': '#CF2B2B',
  'cn': '#CF2B2B', 'jp': '#CF2B2B', 'in': '#E07030', 'au': '#CF2B2B',
  'ua': '#4A7FE5', 'by': '#CF2B2B', 'rs': '#4A7FE5', 'hr': '#4A7FE5',
  'il': '#4A7FE5', 'sa': '#5DB86A', 'ma': '#CF2B2B', 'br': '#5DB86A',
}

const DEFAULT_COLOR = 'rgba(255,255,255,0.88)'

function calcIso(pCountry: string): string { return COUNTRY_TO_ISO[pCountry] ?? '' }
function calcPlaneColor(pCountry: string): string {
  const lIso = calcIso(pCountry)
  return lIso ? (COUNTRY_COLORS[lIso] ?? DEFAULT_COLOR) : DEFAULT_COLOR
}

// ─── Taille selon type OACI ───────────────────────────────────────────────────

type AircraftSize = 'heavy' | 'widebody' | 'narrowbody' | 'regional' | 'small'

const SIZE_DIMS: Record<AircraftSize, [number, number]> = {
  heavy:      [32, 38],
  widebody:   [25, 30],
  narrowbody: [18, 22],
  regional:   [13, 16],
  small:      [10, 12],
}

const HEAVY_TYPES      = new Set(['A388','A380','B744','B748','B747','B77W','B77L','B77F','B778','B779','A343','A346','A342'])
const WIDEBODY_TYPES   = new Set(['A332','A333','A338','A339','A359','A35K','B788','B789','B78X','B762','B763','B764','A306','A30B','B752','B753'])
const NARROWBODY_TYPES = new Set(['A319','A320','A321','A20N','A21N','B737','B738','B739','B735','B736','B38M','B39M','B3XM','MD82','MD83'])
const REGIONAL_TYPES   = new Set(['E170','E175','E190','E195','E290','E295','AT72','AT76','AT75','AT43','AT42','CRJ2','CRJ7','CRJ9','CRJX','DH8D','DH8C','SF34','JS41','F50','F100'])

function calcAircraftSize(pType: string): AircraftSize {
  if (!pType) return 'narrowbody'
  const lT = pType.toUpperCase()
  if (HEAVY_TYPES.has(lT))      return 'heavy'
  if (WIDEBODY_TYPES.has(lT))   return 'widebody'
  if (NARROWBODY_TYPES.has(lT)) return 'narrowbody'
  if (REGIONAL_TYPES.has(lT))   return 'regional'
  return 'small'
}

function calcPlaneDims(pIcao24: string): [number, number] {
  const lType = mDetails[pIcao24]?.type ?? ''
  return SIZE_DIMS[calcAircraftSize(lType)]
}

// ─── Distance depuis Bure (haversine) ─────────────────────────────────────────

function calcDistanceBure(pLat: number, pLon: number): number {
  const lDlat = (pLat - BURE_LAT) * Math.PI / 180
  const lDlon = (pLon - BURE_LON) * Math.PI / 180
  const lA    = Math.sin(lDlat / 2) ** 2 +
    Math.cos(BURE_LAT * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) * Math.sin(lDlon / 2) ** 2
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(lA), Math.sqrt(1 - lA)))
}

// ─── Filtrage : uniquement les avions dans le rayon MAX_KM ───────────────────

const mFilteredPlanes = computed(() =>
  mPlanes.value.filter(lP => calcDistanceBure(lP.latitude, lP.longitude) <= MAX_KM)
)

// ─── Positionnement & profondeur ──────────────────────────────────────────────

function calcPlaneY(pPlane: Plane): number {
  const lY = 70 - ((pPlane.altitude - ALT_MIN) / (ALT_MAX - ALT_MIN)) * 65
  return Math.max(4, Math.min(70, lY))
}

function calcPositionStyle(pPlane: Plane): Record<string, string> {
  const lX    = 3 + ((pPlane.longitude - LON_MIN) / (LON_MAX - LON_MIN)) * 94
  const lDist  = calcDistanceBure(pPlane.latitude, pPlane.longitude)
  const lScale = 1.0 - Math.min(lDist / MAX_KM, 1) * 0.30

  return {
    left:      `${Math.max(2, Math.min(97, lX))}%`,
    top:       `${calcPlaneY(pPlane)}%`,
    transform: `scale(${lScale.toFixed(3)})`,
    transition: 'left 298s linear, top 298s linear',
  }
}

function calcTooltipFlipped(pPlane: Plane): boolean {
  return calcPlaneY(pPlane) < 30
}

// ─── Opacité de profondeur ────────────────────────────────────────────────────

function calcDepthOpacity(pPlane: Plane): number {
  const lDist  = calcDistanceBure(pPlane.latitude, pPlane.longitude)
  const lNight = mWeatherStore.timeOfDay === 'night' ? 0.65 : 0.92
  const lDepth = 1.0 - Math.min(lDist / MAX_KM, 1) * 0.35
  return lNight * lDepth
}

// ─── Survol via mousemove document ────────────────────────────────────────────
// Le canvas de l'arbre (z-index 3, pointer-events: all) bloque les hover CSS
// sur les avions (z-index 2). On détecte la proximité souris via mousemove global.

const mHovered = ref<Plane | null>(null)
const HOVER_RADIUS = 32 // pixels

function calcPlaneViewportPos(pPlane: Plane): { x: number; y: number } {
  const lX = (3 + ((pPlane.longitude - LON_MIN) / (LON_MAX - LON_MIN)) * 94) / 100 * window.innerWidth
  const lY = calcPlaneY(pPlane) / 100 * window.innerHeight
  return { x: lX, y: lY }
}

function onDocMouseMove(pEvt: MouseEvent): void {
  let lClosest: Plane | null = null
  let lMinDist = HOVER_RADIUS
  for (const lPlane of mFilteredPlanes.value) {
    const lPos  = calcPlaneViewportPos(lPlane)
    const lDist = Math.hypot(pEvt.clientX - lPos.x, pEvt.clientY - lPos.y)
    if (lDist < lMinDist) { lMinDist = lDist; lClosest = lPlane }
  }
  mHovered.value = lClosest
}

onMounted(() => { document.addEventListener('mousemove', onDocMouseMove) })
onUnmounted(() => { document.removeEventListener('mousemove', onDocMouseMove) })

const mTooltipStyle = computed((): CSSProperties => {
  if (!mHovered.value || !import.meta.client) return {}
  const lPos     = calcPlaneViewportPos(mHovered.value)
  const lFlipped = calcTooltipFlipped(mHovered.value)
  if (lFlipped) {
    return { position: 'fixed', left: `${lPos.x}px`, top: `${lPos.y + 20}px`, transform: 'translateX(-50%)' }
  }
  return { position: 'fixed', left: `${lPos.x}px`, top: `${lPos.y}px`, transform: 'translateX(-50%) translateY(-100%)' }
})

function calcHasDetails(pIcao24: string): boolean {
  const lD = mDetails[pIcao24]
  return !!(lD && (lD.registration || lD.manufacturer || lD.type || lD.operator))
}

// ─── Utilitaires d'affichage ──────────────────────────────────────────────────

function calcSpeedKmh(pV: number): number   { return Math.round(pV * 3.6) }
function calcAltitudeFt(pA: number): number { return Math.round(pA * 3.281) }

function calcVerticalLabel(pRate: number): string {
  if (pRate >  2) return '↑'
  if (pRate < -2) return '↓'
  return '→'
}

function calcSquawkLabel(pSquawk: string): { label: string; emergency: boolean } {
  if (pSquawk === '7700') return { label: '7700 URGENCE',      emergency: true }
  if (pSquawk === '7600') return { label: '7600 RADIO',        emergency: true }
  if (pSquawk === '7500') return { label: '7500 DETOURNEMENT', emergency: true }
  return { label: pSquawk || '----', emergency: false }
}
</script>

<template>
  <div aria-hidden="true" class="scene-planes">
    <TransitionGroup name="plane-fade">
      <div
        v-for="lPlane in mFilteredPlanes"
        :key="lPlane.icao24"
        class="plane-item"
        :style="calcPositionStyle(lPlane)"
      >
        <!-- Icône avion SVG -->
        <div
          class="plane-icon"
          :style="{
            transform: `rotate(${lPlane.heading}deg)`,
            opacity:   String(calcDepthOpacity(lPlane)),
            color:     calcPlaneColor(lPlane.country),
            filter:    `drop-shadow(0 0 5px ${calcPlaneColor(lPlane.country)})`,
          }"
        >
          <svg
            :width="calcPlaneDims(lPlane.icao24)[0]"
            :height="calcPlaneDims(lPlane.icao24)[1]"
            viewBox="0 0 20 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M10,0.5 C11.3,0.5 12,2 12,5 L12,17.5 C12,20 11.5,22.5 10,24 C8.5,22.5 8,20 8,17.5 L8,5 C8,2 8.7,0.5 10,0.5 Z"/>
            <path d="M12,8.5 L20,16.5 L18.8,18 L12,13 L8,13 L1.2,18 L0,16.5 Z"/>
            <path d="M10,20.5 L6.5,23.5 L7.2,24 L10,22 L12.8,24 L13.5,23.5 Z"/>
          </svg>
          <!-- Feux de navigation (nuit) -->
          <span v-if="mWeatherStore.timeOfDay === 'night'" class="nav-light nav-light--red" />
          <span v-if="mWeatherStore.timeOfDay === 'night'" class="nav-light nav-light--green" />
        </div>

        <!-- Drapeau + callsign -->
        <div class="plane-label">
          <span v-if="calcIso(lPlane.country)" :class="`fi fi-${calcIso(lPlane.country)}`" class="plane-flag" />
          <span class="plane-callsign">{{ lPlane.callsign }}</span>
        </div>

      </div>
    </TransitionGroup>
  </div>

  <!-- Tooltip téléporté sur body pour échapper au stacking context z-index 2 -->
  <Teleport to="body">
    <Transition name="tooltip-fade">
      <div
        v-if="mHovered"
        class="plane-tooltip-teleport"
        :style="mTooltipStyle"
      >
        <div class="tooltip-header">
          <span v-if="calcIso(mHovered.country)" :class="`fi fi-${calcIso(mHovered.country)}`" class="tooltip-flag" />
          <span class="tooltip-callsign">{{ mHovered.callsign }}</span>
          <span v-if="mDetails[mHovered.icao24]?.registration" class="tooltip-reg">
            {{ mDetails[mHovered.icao24].registration }}
          </span>
        </div>

        <template v-if="calcHasDetails(mHovered.icao24)">
          <div v-if="mDetails[mHovered.icao24]?.manufacturer || mDetails[mHovered.icao24]?.type" class="tooltip-aircraft">
            <span v-if="mDetails[mHovered.icao24]?.manufacturer">{{ mDetails[mHovered.icao24].manufacturer }}</span>
            <span v-if="mDetails[mHovered.icao24]?.type" class="tooltip-type"> {{ mDetails[mHovered.icao24].type }}</span>
          </div>
          <div v-if="mDetails[mHovered.icao24]?.operator" class="tooltip-operator">
            {{ mDetails[mHovered.icao24].operator }}
          </div>
          <div class="tooltip-divider" />
        </template>

        <div class="tooltip-row">
          <span class="tooltip-label">Alt</span>
          <span>{{ calcAltitudeFt(mHovered.altitude).toLocaleString() }} ft</span>
          <span class="tooltip-sub">({{ Math.round(mHovered.altitude) }} m)</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Vit</span>
          <span>{{ calcSpeedKmh(mHovered.velocity) }} km/h</span>
          <span class="tooltip-sub">{{ calcVerticalLabel(mHovered.verticalRate) }}</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Cap</span>
          <span>{{ Math.round(mHovered.heading) }}°</span>
        </div>
        <div class="tooltip-row">
          <span class="tooltip-label">Dist</span>
          <span>{{ calcDistanceBure(mHovered.latitude, mHovered.longitude) }} km de Bure</span>
        </div>
        <div class="tooltip-row" :class="{ 'tooltip-emergency': calcSquawkLabel(mHovered.squawk).emergency }">
          <span class="tooltip-label">Sqk</span>
          <span>{{ calcSquawkLabel(mHovered.squawk).label }}</span>
        </div>

        <div class="tooltip-country">{{ mHovered.country }}</div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.scene-planes {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.plane-item {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  pointer-events: auto;
  cursor: default;
  transform-origin: center center;
  /* Zone de clic élargie pour faciliter le survol sur petits avions */
  padding: 8px;
  margin: -8px;
}

.plane-icon {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 2s ease, filter 0.3s ease;
}

/* Feux wingtip */
.nav-light {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  animation: blink 1.4s ease-in-out infinite;
}
.nav-light--red   { left: 0; top: 50%; background: #ff3333; animation-delay: 0s; }
.nav-light--green { right: 0; top: 50%; background: #33ff88; animation-delay: 0.7s; }

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.1; }
}

/* Label */
.plane-label {
  display: flex;
  align-items: center;
  gap: 3px;
  pointer-events: none;
}

.plane-flag {
  width: 12px !important;
  height: 9px;
  border-radius: 1px;
  flex-shrink: 0;
  box-shadow: 0 0 3px rgba(0,0,0,0.6);
}

.plane-callsign {
  font-size: 9px;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-weight: 600;
  color: rgba(255,255,255,0.88);
  text-shadow: 0 0 6px rgba(0,0,0,0.95), 0 1px 2px rgba(0,0,0,0.9);
  white-space: nowrap;
  letter-spacing: 0.04em;
}

/* ─── Tooltip ──────────────────────────────────────────────────────────────── */

/* Tooltip téléporté sur body - position fixed gérée via mTooltipStyle */
.plane-tooltip-teleport {
  background: rgba(8,10,24,0.96);
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 10px;
  padding: 10px 13px;
  min-width: 195px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  z-index: 200;
  pointer-events: none;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.tooltip-header { display: flex; align-items: center; gap: 7px; margin-bottom: 3px; }

.tooltip-flag {
  width: 16px !important;
  height: 12px;
  border-radius: 2px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.5);
}

.tooltip-callsign { font-size: 13px; font-weight: 700; color: #e8eeff; letter-spacing: 0.08em; }
.tooltip-reg      { font-size: 10px; color: rgba(148,163,184,0.8); margin-left: auto; }

.tooltip-aircraft { font-size: 10px; color: rgba(99,179,237,0.95); margin-bottom: 1px; font-weight: 500; }
.tooltip-type     { font-weight: 700; margin-left: 4px; }

.tooltip-operator {
  font-size: 9px;
  color: rgba(167,243,208,0.85);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 210px;
}

.tooltip-divider  { height: 1px; background: rgba(255,255,255,0.07); margin: 6px 0; }

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  color: rgba(255,255,255,0.72);
  margin-bottom: 2px;
}
.tooltip-label    { color: rgba(148,163,184,0.85); width: 28px; flex-shrink: 0; }
.tooltip-sub      { color: rgba(148,163,184,0.65); font-size: 9px; }

.tooltip-emergency { color: #ff6b6b; font-weight: 700; animation: pulse-red 1s ease-in-out infinite; }
@keyframes pulse-red { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.tooltip-country {
  margin-top: 5px;
  font-size: 9px;
  color: rgba(148,163,184,0.5);
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 5px;
}

/* Transitions */
.plane-fade-enter-active, .plane-fade-leave-active { transition: opacity 1.5s ease; }
.plane-fade-enter-from, .plane-fade-leave-to       { opacity: 0; }

.tooltip-fade-enter-active, .tooltip-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.tooltip-fade-enter-from, .tooltip-fade-leave-to {
  opacity: 0;
}

@media (max-width: 640px) { .scene-planes { display: none; } }
</style>
