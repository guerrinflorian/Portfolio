<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - oiseaux pixelisés traversant l'écran (absents par mauvais temps)

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useWeatherStore } from '~/stores/weather'

const weatherStore = useWeatherStore()
const mCanvas = ref<HTMLCanvasElement | null>(null)

// ─── Type oiseau ──────────────────────────────────────────────────────────────

interface Bird {
  x: number
  y: number
  vx: number
  vy: number
  phase: number        // phase de battement d'ailes
  phaseSpeed: number
  size: number
  alpha: number
  active: boolean
  resetDelay: number   // ms avant de réapparaître après sortie d'écran
  resetTimer: number
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const BIRD_COUNT      = 3
const BIRD_Y_RANGE    = [0.08, 0.42]  // Fraction écran - zone ciel
const HIDDEN_STATES   = new Set(['rain', 'snow', 'storm', 'fog'])

let mCtx: CanvasRenderingContext2D | null = null
let mRafId = 0
let mBirds: Bird[] = []
let mLastTime = 0

// ─── Création d'un oiseau ─────────────────────────────────────────────────────

function createBird(pW: number, pH: number, pOffscreen = true): Bird {
  const lGoRight = Math.random() > 0.5
  return {
    x:          pOffscreen ? (lGoRight ? -60 : pW + 60) : Math.random() * pW,
    y:          BIRD_Y_RANGE[0]! * pH + Math.random() * (BIRD_Y_RANGE[1]! - BIRD_Y_RANGE[0]!) * pH,
    vx:         (lGoRight ? 1 : -1) * (0.5 + Math.random() * 0.7),
    vy:         (Math.random() - 0.5) * 0.08,
    phase:      Math.random() * Math.PI * 2,
    phaseSpeed: 0.06 + Math.random() * 0.04,
    size:       1.2 + Math.random() * 0.8,
    alpha:      0.45 + Math.random() * 0.25,
    active:     true,
    resetDelay: 8000 + Math.random() * 12000,
    resetTimer: 0,
  }
}

function initBirds(): void {
  if (!mCanvas.value) return
  const lW = mCanvas.value.width
  const lH = mCanvas.value.height
  // Initialiser les oiseaux à des positions aléatoires (pas forcément hors-écran)
  mBirds = Array.from({ length: BIRD_COUNT }, () => createBird(lW, lH, false))
}

// ─── Dessin d'un oiseau ───────────────────────────────────────────────────────

function drawBird(pCtx: CanvasRenderingContext2D, pBird: Bird): void {
  const lFlap = Math.sin(pBird.phase) * 2.8 * pBird.size

  pCtx.save()
  pCtx.translate(pBird.x, pBird.y)
  if (pBird.vx < 0) pCtx.scale(-1, 1)

  pCtx.beginPath()
  // Aile gauche
  pCtx.moveTo(0, 0)
  pCtx.quadraticCurveTo(-pBird.size * 3.5, -lFlap, -pBird.size * 7, lFlap * 0.6)
  // Aile droite
  pCtx.moveTo(0, 0)
  pCtx.quadraticCurveTo( pBird.size * 3.5, -lFlap,  pBird.size * 7, lFlap * 0.6)

  pCtx.strokeStyle = `rgba(255, 255, 255, ${pBird.alpha})`
  pCtx.lineWidth   = pBird.size * 0.9
  pCtx.lineCap     = 'round'
  pCtx.stroke()
  pCtx.restore()
}

// ─── Boucle d'animation ───────────────────────────────────────────────────────

function render(pNow: number): void {
  if (!mCanvas.value || !mCtx) return

  const lDelta = pNow - mLastTime
  mLastTime    = pNow

  const lW = mCanvas.value.width
  const lH = mCanvas.value.height

  mCtx.clearRect(0, 0, lW, lH)

  // Pas d'oiseaux par mauvais temps
  const lHidden = HIDDEN_STATES.has(weatherStore.state)

  for (const lBird of mBirds) {
    if (!lBird.active) {
      // Attente avant réapparition
      lBird.resetTimer += lDelta
      if (lBird.resetTimer >= lBird.resetDelay) {
        Object.assign(lBird, createBird(lW, lH, true))
      }
      continue
    }

    if (!lHidden) {
      drawBird(mCtx, lBird)
    }

    // Mise à jour position
    lBird.x     += lBird.vx
    lBird.y     += lBird.vy
    lBird.phase += lBird.phaseSpeed

    // Sortie d'écran → désactiver et programmer la réapparition
    if (lBird.x < -80 || lBird.x > lW + 80) {
      lBird.active     = false
      lBird.resetTimer = 0
    }
  }

  mRafId = requestAnimationFrame(render)
}

// ─── Resize ───────────────────────────────────────────────────────────────────

function resize(): void {
  if (!mCanvas.value) return
  mCanvas.value.width  = window.innerWidth
  mCanvas.value.height = window.innerHeight
}

watch(() => weatherStore.state, () => {
  // Les oiseaux continuent de voler mais sont simplement non-dessinés
})

onMounted(() => {
  if (!mCanvas.value) return
  mCtx = mCanvas.value.getContext('2d')
  resize()
  initBirds()
  mLastTime = performance.now()
  mRafId    = requestAnimationFrame(render)
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(mRafId)
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas
    ref="mCanvas"
    class="birds-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.birds-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 4;
}
</style>
