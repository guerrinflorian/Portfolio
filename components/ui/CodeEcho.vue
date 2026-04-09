<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// CodeEcho - tokens de code apparaissant au curseur sur mousemove / keydown

import { ref, onMounted, onUnmounted } from 'vue'

interface EchoParticle {
  id: number
  x: number
  y: number
  text: string
  color: string
}

const TOKENS = ['{', '}', '=>', '//', '&&', '[]', '()', '===', 'null', 'const', '?.', '++', '||', '!==', '0x']
const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#a78bfa', '#f472b6', '#38bdf8', '#4ade80']
const MAX_PARTICLES = 10
const MIN_DIST = 90      // distance min entre deux spawns souris (px)
const THROTTLE_MS = 150  // delai min entre deux spawns souris (ms)

let mNextId = 0
const mParticles = ref<EchoParticle[]>([])

let mLastMouseX = 0
let mLastMouseY = 0
let mLastSpawnTime = 0

function spawnAt(x: number, y: number): void {
  const lNow = Date.now()
  if (lNow - mLastSpawnTime < THROTTLE_MS) return
  mLastSpawnTime = lNow

  const lToken = TOKENS[Math.floor(Math.random() * TOKENS.length)]
  const lColor = COLORS[Math.floor(Math.random() * COLORS.length)]
  const lOffset = Math.round((Math.random() - 0.5) * 20)

  const lParticle: EchoParticle = {
    id: mNextId++,
    x: x + lOffset,
    y: y - 10,
    text: lToken,
    color: lColor,
  }

  if (mParticles.value.length >= MAX_PARTICLES) {
    mParticles.value.shift()
  }
  mParticles.value.push(lParticle)

  setTimeout(() => {
    const lIdx = mParticles.value.findIndex(p => p.id === lParticle.id)
    if (lIdx !== -1) mParticles.value.splice(lIdx, 1)
  }, 900)
}

function onMouseMove(e: MouseEvent): void {
  const lDx = e.clientX - mLastMouseX
  const lDy = e.clientY - mLastMouseY
  const lDist = Math.sqrt(lDx * lDx + lDy * lDy)
  if (lDist < MIN_DIST) return
  mLastMouseX = e.clientX
  mLastMouseY = e.clientY
  spawnAt(e.clientX, e.clientY)
}

function onKeyDown(e: KeyboardEvent): void {
  // Ignorer les touches de navigation / modificateurs
  if (e.key.length > 1) return
  spawnAt(mLastMouseX, mLastMouseY)
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove, { passive: true })
  window.addEventListener('keydown', onKeyDown, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="code-echo" aria-hidden="true">
    <span
      v-for="p in mParticles"
      :key="p.id"
      class="echo-token"
      :style="{ left: p.x + 'px', top: p.y + 'px', color: p.color }"
    >{{ p.text }}</span>
  </div>
</template>

<style scoped>
.code-echo {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 6;
  overflow: hidden;
}

.echo-token {
  position: absolute;
  font-family: 'JetBrains Mono', 'Fira Code', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  opacity: 0;
  user-select: none;
  animation: echo-float 0.9s ease-out forwards;
  text-shadow: 0 0 8px currentColor;
}

@keyframes echo-float {
  0%   { opacity: 0;   transform: translateY(0)    scale(0.8); }
  15%  { opacity: 0.9; transform: translateY(-6px)  scale(1);   }
  70%  { opacity: 0.6; transform: translateY(-22px) scale(0.95); }
  100% { opacity: 0;   transform: translateY(-32px) scale(0.9); }
}
</style>
