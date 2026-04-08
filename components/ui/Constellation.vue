<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - constellations nocturnes : étoiles reliées façon graphe de neurones

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useWeatherStore } from '~/stores/weather'

const weatherStore = useWeatherStore()
const mCanvas = ref<HTMLCanvasElement | null>(null)

// ─── Positions d'étoiles normalisées [x, y, éclat] ───────────────────────────
// Limitées au quart supérieur (ciel), hors zone arbre

const STARS: Array<[number, number, number]> = [
  [0.06, 0.04, 0.9], [0.13, 0.11, 0.7], [0.20, 0.07, 0.85], [0.10, 0.20, 0.6],
  [0.27, 0.15, 0.75], [0.34, 0.05, 0.95], [0.41, 0.13, 0.7], [0.37, 0.22, 0.8],
  [0.50, 0.07, 0.65], [0.46, 0.28, 0.72], [0.57, 0.04, 0.9], [0.63, 0.14, 0.7],
  [0.70, 0.08, 0.88], [0.78, 0.11, 0.75], [0.74, 0.24, 0.82], [0.86, 0.05, 0.9],
  [0.92, 0.17, 0.65], [0.84, 0.28, 0.78], [0.54, 0.17, 0.82], [0.61, 0.27, 0.7],
  [0.03, 0.34, 0.55], [0.17, 0.37, 0.72], [0.26, 0.30, 0.68], [0.44, 0.36, 0.6],
  [0.69, 0.33, 0.7], [0.81, 0.38, 0.62], [0.95, 0.32, 0.55],
]

// Distance normalisée max pour relier deux étoiles
const MAX_LINK_DIST = 0.17

function draw(): void {
  if (!mCanvas.value) return
  const lCtx = mCanvas.value.getContext('2d')
  if (!lCtx) return

  const lW = mCanvas.value.width
  const lH = mCanvas.value.height
  lCtx.clearRect(0, 0, lW, lH)

  // Visible uniquement la nuit / au crépuscule
  if (weatherStore.isDay) return

  // Lignes de constellation
  lCtx.lineWidth = 0.6
  for (let lI = 0; lI < STARS.length; lI++) {
    for (let lJ = lI + 1; lJ < STARS.length; lJ++) {
      const lA = STARS[lI]!
      const lB = STARS[lJ]!
      const lDx   = lA[0] - lB[0]
      const lDy   = lA[1] - lB[1]
      const lDist = Math.sqrt(lDx * lDx + lDy * lDy)

      if (lDist < MAX_LINK_DIST) {
        // Opacité inversement proportionnelle à la distance
        const lAlpha = (1 - lDist / MAX_LINK_DIST) * 0.07
        lCtx.strokeStyle = `rgba(180, 210, 255, ${lAlpha})`
        lCtx.beginPath()
        lCtx.moveTo(lA[0] * lW, lA[1] * lH)
        lCtx.lineTo(lB[0] * lW, lB[1] * lH)
        lCtx.stroke()
      }
    }
  }

  // Points d'étoiles
  for (const lStar of STARS) {
    const lRadius = 0.8 + lStar[2] * 1.4
    const lAlpha  = 0.25 + lStar[2] * 0.55
    lCtx.beginPath()
    lCtx.arc(lStar[0] * lW, lStar[1] * lH, lRadius, 0, Math.PI * 2)
    lCtx.fillStyle = `rgba(220, 235, 255, ${lAlpha})`
    lCtx.fill()
  }
}

function resize(): void {
  if (!mCanvas.value) return
  mCanvas.value.width  = window.innerWidth
  mCanvas.value.height = window.innerHeight
  draw()
}

// Redessiner quand le jour/nuit change
watch(() => weatherStore.isDay, () => draw())

onMounted(() => {
  resize()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
})
</script>

<template>
  <canvas
    ref="mCanvas"
    class="constellation-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.constellation-canvas {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}
</style>
