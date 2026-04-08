<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - effets météo Canvas (pluie, neige, brouillard, éclairs)

import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useWeatherStore } from '~/stores/weather'

// ─── Types internes ────────────────────────────────────────────────────────────

interface RainDrop {
  x: number
  y: number
  length: number
  speed: number
  angle: number    // rad
}

interface SnowFlake {
  x: number
  y: number
  radius: number
  speed: number
  drift: number
  driftOffset: number
  alpha: number
}

interface FogLayer {
  x: number
  y: number
  width: number
  height: number
  speed: number
  alpha: number
  direction: number  // 1 ou -1
}

// ─── Constantes ────────────────────────────────────────────────────────────────

const RAIN_COLOR          = 'rgba(174, 214, 241, 0.6)'
const RAIN_COUNT_MIN      = 200
const RAIN_COUNT_MAX      = 400
const DROP_LENGTH_MIN     = 8
const DROP_LENGTH_MAX     = 20
const DROP_SPEED_MIN      = 8
const DROP_SPEED_MAX      = 15
const DROP_ANGLE_MIN_DEG  = 10
const DROP_ANGLE_MAX_DEG  = 30

const SNOW_COUNT_MIN      = 150
const SNOW_COUNT_MAX      = 300
const FLAKE_RADIUS_MIN    = 2
const FLAKE_RADIUS_MAX    = 6

const FOG_LAYER_COUNT     = 4

const LIGHTNING_INTERVAL_MIN_MS = 3000
const LIGHTNING_INTERVAL_MAX_MS = 8000

// ─── Store ────────────────────────────────────────────────────────────────────

const mWeatherStore = useWeatherStore()

// ─── Refs Canvas ──────────────────────────────────────────────────────────────

const mCanvas = ref<HTMLCanvasElement | null>(null)
let mCtx: CanvasRenderingContext2D | null = null
let mRafId: number = 0

// ─── Particules ───────────────────────────────────────────────────────────────

let mRainDrops: RainDrop[]   = []
let mSnowFlakes: SnowFlake[] = []
let mFogLayers: FogLayer[]   = []
let mLightningTimerId: ReturnType<typeof setTimeout> | null = null
let mFlashAlpha: number = 0

// ─── Fonctions d'initialisation ───────────────────────────────────────────────

function initRainDrops(pWidth: number, pHeight: number): void {
  const lCount    = countRainDrops()
  const lWindSpeed = mWeatherStore.windSpeed
  const calcAngleMax = DROP_ANGLE_MIN_DEG +
    (lWindSpeed / 60) * (DROP_ANGLE_MAX_DEG - DROP_ANGLE_MIN_DEG)
  const calcAngleRad = (calcAngleMax * Math.PI) / 180

  mRainDrops = Array.from({ length: lCount }, () => ({
    x:      Math.random() * pWidth,
    y:      Math.random() * pHeight,
    length: DROP_LENGTH_MIN + Math.random() * (DROP_LENGTH_MAX - DROP_LENGTH_MIN),
    speed:  DROP_SPEED_MIN  + Math.random() * (DROP_SPEED_MAX  - DROP_SPEED_MIN),
    angle:  calcAngleRad * (0.5 + Math.random() * 0.5),
  }))
}

function initSnowFlakes(pWidth: number, pHeight: number): void {
  const lCount = countSnowFlakes()

  mSnowFlakes = Array.from({ length: lCount }, () => ({
    x:           Math.random() * pWidth,
    y:           Math.random() * pHeight,
    radius:      FLAKE_RADIUS_MIN + Math.random() * (FLAKE_RADIUS_MAX - FLAKE_RADIUS_MIN),
    speed:       0.5 + Math.random() * 1.5,
    drift:       (Math.random() - 0.5) * 0.5,
    driftOffset: Math.random() * Math.PI * 2,
    alpha:       0.6 + Math.random() * 0.3,
  }))
}

function initFog(pWidth: number, pHeight: number): void {
  mFogLayers = Array.from({ length: FOG_LAYER_COUNT }, (_, lIndex) => ({
    x:         0,
    y:         (pHeight / FOG_LAYER_COUNT) * lIndex,
    width:     pWidth * 1.5,
    height:    pHeight / FOG_LAYER_COUNT,
    speed:     0.1 + Math.random() * 0.2,
    alpha:     0.1 + Math.random() * 0.15,
    direction: lIndex % 2 === 0 ? 1 : -1,
  }))
}

// ─── Calculs ──────────────────────────────────────────────────────────────────

function countRainDrops(): number {
  const lIntensity = Math.min(mWeatherStore.precipitation / 10, 1)
  return Math.floor(RAIN_COUNT_MIN + lIntensity * (RAIN_COUNT_MAX - RAIN_COUNT_MIN))
}

function countSnowFlakes(): number {
  const lIntensity = Math.min(mWeatherStore.precipitation / 5, 1)
  return Math.floor(SNOW_COUNT_MIN + lIntensity * (SNOW_COUNT_MAX - SNOW_COUNT_MIN))
}

// ─── Rendu ────────────────────────────────────────────────────────────────────

function drawRain(pCtx: CanvasRenderingContext2D, pWidth: number, pHeight: number): void {
  pCtx.save()
  pCtx.strokeStyle = RAIN_COLOR
  pCtx.lineWidth = 1

  for (const lDrop of mRainDrops) {
    pCtx.beginPath()
    pCtx.moveTo(lDrop.x, lDrop.y)
    pCtx.lineTo(
      lDrop.x + Math.sin(lDrop.angle) * lDrop.length,
      lDrop.y + Math.cos(lDrop.angle) * lDrop.length
    )
    pCtx.stroke()

    // Mise à jour position
    lDrop.x += Math.sin(lDrop.angle) * lDrop.speed
    lDrop.y += Math.cos(lDrop.angle) * lDrop.speed

    if (lDrop.y > pHeight) {
      lDrop.y = -lDrop.length
      lDrop.x = Math.random() * pWidth
    }
  }

  pCtx.restore()
}

function drawSnow(pCtx: CanvasRenderingContext2D, pWidth: number, pHeight: number): void {
  pCtx.save()

  for (const lFlake of mSnowFlakes) {
    pCtx.beginPath()
    pCtx.arc(lFlake.x, lFlake.y, lFlake.radius, 0, Math.PI * 2)
    pCtx.fillStyle = `rgba(255, 255, 255, ${lFlake.alpha})`
    pCtx.fill()

    // Mouvement sinusoïdal
    lFlake.driftOffset += 0.02
    lFlake.x += Math.sin(lFlake.driftOffset) * lFlake.drift + lFlake.drift
    lFlake.y += lFlake.speed

    if (lFlake.y > pHeight) {
      lFlake.y = -lFlake.radius
      lFlake.x = Math.random() * pWidth
    }
  }

  pCtx.restore()
}

function drawFog(pCtx: CanvasRenderingContext2D, pWidth: number, pHeight: number): void {
  pCtx.save()

  for (const lLayer of mFogLayers) {
    pCtx.fillStyle = `rgba(200, 210, 220, ${lLayer.alpha})`
    pCtx.fillRect(lLayer.x, lLayer.y, lLayer.width, lLayer.height)

    lLayer.x += lLayer.speed * lLayer.direction

    // Défilement cyclique
    if (lLayer.direction === 1 && lLayer.x > pWidth * 0.5) {
      lLayer.x = -pWidth
    } else if (lLayer.direction === -1 && lLayer.x < -pWidth * 0.5) {
      lLayer.x = 0
    }
  }

  pCtx.restore()
}

function drawFlash(pCtx: CanvasRenderingContext2D, pWidth: number, pHeight: number): void {
  if (mFlashAlpha <= 0) return

  pCtx.save()
  pCtx.fillStyle = `rgba(255, 255, 255, ${mFlashAlpha})`
  pCtx.fillRect(0, 0, pWidth, pHeight)
  pCtx.restore()

  mFlashAlpha = Math.max(0, mFlashAlpha - 0.05)
}

// ─── Gestion éclairs ──────────────────────────────────────────────────────────

function triggerLightning(): void {
  mFlashAlpha = 0.8

  // Prochain éclair aléatoire
  const lDelay = LIGHTNING_INTERVAL_MIN_MS +
    Math.random() * (LIGHTNING_INTERVAL_MAX_MS - LIGHTNING_INTERVAL_MIN_MS)

  mLightningTimerId = setTimeout(triggerLightning, lDelay)
}

function startLightning(): void {
  if (mLightningTimerId !== null) return
  const lDelay = LIGHTNING_INTERVAL_MIN_MS +
    Math.random() * (LIGHTNING_INTERVAL_MAX_MS - LIGHTNING_INTERVAL_MIN_MS)
  mLightningTimerId = setTimeout(triggerLightning, lDelay)
}

function stopLightning(): void {
  if (mLightningTimerId !== null) {
    clearTimeout(mLightningTimerId)
    mLightningTimerId = null
  }
}

// ─── Boucle de rendu ──────────────────────────────────────────────────────────

function render(): void {
  if (!mCanvas.value || !mCtx) return

  const lWidth  = mCanvas.value.width
  const lHeight = mCanvas.value.height
  const lState  = mWeatherStore.state

  mCtx.clearRect(0, 0, lWidth, lHeight)

  if (lState === 'rain' || lState === 'storm') drawRain(mCtx, lWidth, lHeight)
  if (lState === 'snow')                       drawSnow(mCtx, lWidth, lHeight)
  if (lState === 'fog' || lState === 'overcast') drawFog(mCtx, lWidth, lHeight)
  if (lState === 'storm')                      drawFlash(mCtx, lWidth, lHeight)

  mRafId = requestAnimationFrame(render)
}

// ─── Redimensionnement ────────────────────────────────────────────────────────

function resizeCanvas(): void {
  if (!mCanvas.value) return
  const lWidth  = window.innerWidth
  const lHeight = window.innerHeight

  mCanvas.value.width  = lWidth
  mCanvas.value.height = lHeight

  // Réinitialiser les particules selon l'état actuel
  const lState = mWeatherStore.state
  if (lState === 'rain' || lState === 'storm') initRainDrops(lWidth, lHeight)
  if (lState === 'snow')                       initSnowFlakes(lWidth, lHeight)
  if (lState === 'fog' || lState === 'overcast') initFog(lWidth, lHeight)
}

// ─── Réactivité météo ─────────────────────────────────────────────────────────

watch(
  () => mWeatherStore.state,
  (lNewState) => {
    if (!mCanvas.value) return
    const lWidth  = mCanvas.value.width
    const lHeight = mCanvas.value.height

    // Réinitialiser les particules selon le nouvel état
    if (lNewState === 'rain' || lNewState === 'storm') initRainDrops(lWidth, lHeight)
    if (lNewState === 'snow')                          initSnowFlakes(lWidth, lHeight)
    if (lNewState === 'fog' || lNewState === 'overcast') initFog(lWidth, lHeight)

    // Gestion des éclairs
    if (lNewState === 'storm') {
      startLightning()
    } else {
      stopLightning()
    }
  }
)

// ─── Cycle de vie ─────────────────────────────────────────────────────────────

onMounted(() => {
  if (!mCanvas.value) return

  mCtx = mCanvas.value.getContext('2d')
  resizeCanvas()

  const lState  = mWeatherStore.state
  const lWidth  = mCanvas.value.width
  const lHeight = mCanvas.value.height

  if (lState === 'rain' || lState === 'storm') initRainDrops(lWidth, lHeight)
  if (lState === 'snow')                       initSnowFlakes(lWidth, lHeight)
  if (lState === 'fog' || lState === 'overcast') initFog(lWidth, lHeight)
  if (lState === 'storm')                      startLightning()

  mRafId = requestAnimationFrame(render)

  window.addEventListener('resize', resizeCanvas)
})

onUnmounted(() => {
  cancelAnimationFrame(mRafId)
  stopLightning()
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<template>
  <canvas
    ref="mCanvas"
    class="canvas-layer"
    style="z-index: 2; pointer-events: none;"
    aria-hidden="true"
  />
</template>
