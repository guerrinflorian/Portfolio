<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - fond de scène (ciel dégradé, sol saisonnier, étoiles)

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useSceneStore } from '~/stores/scene'
import { useWeatherStore } from '~/stores/weather'
import { useScene } from '~/composables/useScene'

// ─── Stores & composables ─────────────────────────────────────────────────────

const mSceneStore = useSceneStore()
const mWeatherStore = useWeatherStore()
useScene()  // Applique les CSS custom properties

// ─── Canvas étoiles ────────────────────────────────────────────────────────────

const mStarsCanvas = ref<HTMLCanvasElement | null>(null)
let mStarsCtx: CanvasRenderingContext2D | null = null

interface Star {
  x: number
  y: number
  radius: number
  alpha: number
  twinkleSpeed: number
  twinkleOffset: number
}

const NOMBRE_ETOILES = 120
let mEtoiles: Star[] = []
let mStarsRafId = 0

function genererEtoiles(pLargeur: number, pHauteur: number): void {
  mEtoiles = Array.from({ length: NOMBRE_ETOILES }, () => ({
    x: Math.random() * pLargeur,
    y: Math.random() * pHauteur * 0.65, // Seulement dans la partie haute du ciel
    radius: 0.5 + Math.random() * 1.5,
    alpha: 0.3 + Math.random() * 0.7,
    twinkleSpeed: 0.5 + Math.random() * 1.5,
    twinkleOffset: Math.random() * Math.PI * 2,
  }))
}

function dessinerEtoiles(pTemps: number): void {
  if (!mStarsCanvas.value || !mStarsCtx) return

  const lCtx = mStarsCtx
  const lLargeur = mStarsCanvas.value.width
  const lHauteur = mStarsCanvas.value.height

  lCtx.clearRect(0, 0, lLargeur, lHauteur)

  const lEstNuit = !mWeatherStore.isDay || mWeatherStore.timeOfDay === 'night'
  const lEstCrepuscule = mWeatherStore.timeOfDay === 'dawn' || mWeatherStore.timeOfDay === 'dusk'

  if (!lEstNuit && !lEstCrepuscule) return

  const lOpaciteFactor = lEstNuit ? 1 : 0.3

  for (const lEtoile of mEtoiles) {
    const calcAlpha =
      lEtoile.alpha *
      lOpaciteFactor *
      (0.6 + 0.4 * Math.sin(pTemps * lEtoile.twinkleSpeed + lEtoile.twinkleOffset))

    lCtx.beginPath()
    lCtx.arc(lEtoile.x, lEtoile.y, lEtoile.radius, 0, Math.PI * 2)
    lCtx.fillStyle = `rgba(255, 255, 255, ${calcAlpha})`
    lCtx.fill()
  }

  mStarsRafId = requestAnimationFrame((lNow) => dessinerEtoiles(lNow / 1000))
}

function redimensionnerStars(): void {
  if (!mStarsCanvas.value) return
  mStarsCanvas.value.width = window.innerWidth
  mStarsCanvas.value.height = window.innerHeight
  genererEtoiles(mStarsCanvas.value.width, mStarsCanvas.value.height)
}

// ─── Position du soleil ────────────────────────────────────────────────────────
// Heure locale réactive (initialisée côté client uniquement pour éviter le
// décalage SSR/timezone entre dev et prod)

const mHeureLocale = ref(12) // valeur neutre avant hydration

function majHeureLocale(): void {
  const lNow = new Date()
  mHeureLocale.value = lNow.getHours() + lNow.getMinutes() / 60
}

const mSoleilStyle = computed(() => {
  const lHeure = mHeureLocale.value

  // Arc de 180° : 6h = horizon gauche (5%), 20h = horizon droit (95%)
  const HEURE_LEVER = 6
  const HEURE_COUCHER = 20
  const lProgression = (lHeure - HEURE_LEVER) / (HEURE_COUCHER - HEURE_LEVER)
  const lProgressionClampee = Math.max(0, Math.min(1, lProgression))

  // Arc parabolique pour la hauteur
  const calcX = 5 + lProgressionClampee * 90 // 5% → 95% horizontalement
  const calcY = 75 - Math.sin(lProgressionClampee * Math.PI) * 55 // Parabolique

  return {
    left: `${calcX}%`,
    top: `${calcY}%`,
    opacity: mWeatherStore.isDay && mWeatherStore.timeOfDay !== 'night' ? '1' : '0',
  }
})

// ─── Phase de lune ────────────────────────────────────────────────────────────

const mLunePhase = computed(() => {
  const lJour = new Date().getDate()
  // Phase simplifiée : cycle de 29 jours
  const lPhase = (lJour % 29) / 29
  return lPhase
})

const mLuneStyle = computed(() => {
  // Lune visible la nuit uniquement
  const lVisible = !mWeatherStore.isDay || mWeatherStore.timeOfDay === 'night'
  return {
    opacity: lVisible ? '1' : '0',
    transition: 'opacity 2s ease',
  }
})

// ─── Couleur du sol ────────────────────────────────────────────────────────────

const mCouleurSolPrimaire = computed(() => mSceneStore.theme.groundColors.primary)
const mCouleurSolSecondaire = computed(() => mSceneStore.theme.groundColors.secondary)
const mNeige = computed(() => mSceneStore.theme.groundColors.snow)

// ─── Cycle de vie ─────────────────────────────────────────────────────────────

let mSoleilTimerId: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (!mStarsCanvas.value) return
  mStarsCtx = mStarsCanvas.value.getContext('2d')
  redimensionnerStars()
  mStarsRafId = requestAnimationFrame((lNow) => dessinerEtoiles(lNow / 1000))
  window.addEventListener('resize', redimensionnerStars)

  // Initialise l'heure locale côté client (corrige le décalage SSR/timezone)
  majHeureLocale()
  mSoleilTimerId = setInterval(majHeureLocale, 60_000)
})

onUnmounted(() => {
  cancelAnimationFrame(mStarsRafId)
  window.removeEventListener('resize', redimensionnerStars)
  if (mSoleilTimerId !== null) clearInterval(mSoleilTimerId)
})
</script>

<template>
  <div aria-hidden="true" class="scene-background">
    <!-- Ciel dégradé - tweené par GSAP via useScene -->
    <div class="scene-sky" />

    <!-- Image de fond avec opacité -->
    <img
      src="~/assets/images/moi/moi-background-remove.png"
      alt=""
      class="background-image"
      aria-hidden="true"
    />

    <!-- Canvas étoiles (nuit) -->
    <canvas ref="mStarsCanvas" class="canvas-layer" style="z-index: 1;" />

    <!-- Soleil -->
    <div class="soleil" :style="mSoleilStyle" aria-hidden="true">
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <circle cx="30" cy="30" r="18" fill="#FFD700" opacity="0.95" />
        <circle cx="30" cy="30" r="22" fill="#FFD700" opacity="0.25" />
        <circle cx="30" cy="30" r="28" fill="#FFD700" opacity="0.1" />
      </svg>
    </div>

    <!-- Lune -->
    <div class="lune" :style="mLuneStyle" aria-hidden="true">
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <!-- Lune croissante simplifiée -->
        <circle cx="25" cy="25" r="18" fill="#E8E8D0" opacity="0.95" />
        <!-- Masque pour croissant selon phase -->
        <circle
          :cx="25 + (mLunePhase < 0.5 ? -8 : 8)"
          cy="22"
          r="15"
          :fill="'#0a0a1a'"
          :opacity="Math.abs(mLunePhase - 0.5) * 2"
        />
      </svg>
    </div>

    <!-- Sol / herbe - SVG statique bas de page -->
    <div class="sol-container" aria-hidden="true">
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        class="sol-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <!-- Fond neige si hiver -->
        <rect
          v-if="mNeige"
          x="0" y="0" width="1440" height="120"
          fill="#dce8f0"
        />

        <!-- Herbe ondulée -->
        <path
          :d="`M0,60 C120,45 240,75 360,55 C480,35 600,65 720,50
               C840,35 960,65 1080,50 C1200,35 1320,60 1440,45 L1440,120 L0,120 Z`"
          :fill="mCouleurSolPrimaire"
        />
        <!-- Herbe avant -->
        <path
          :d="`M0,80 C180,65 360,95 540,75 C720,55 900,85 1080,70
               C1260,55 1380,80 1440,70 L1440,120 L0,120 Z`"
          :fill="mCouleurSolSecondaire"
        />
      </svg>
    </div>
  </div>
</template>

<style scoped>
.scene-background {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.scene-sky {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, var(--sky-top), var(--sky-bottom));
}

.background-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  opacity: 0.04;
  z-index: 0;
  pointer-events: none;
}

.soleil {
  position: absolute;
  transform: translate(-50%, -50%);
  transition: opacity 2s ease, left 60s linear, top 60s linear;
  z-index: 1;
  filter: drop-shadow(0 0 20px rgba(255, 215, 0, 0.4));
}

.lune {
  position: absolute;
  top: 15%;
  right: 12%;
  z-index: 1;
  filter: drop-shadow(0 0 12px rgba(232, 232, 208, 0.3));
}

.sol-container {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 2;
}

.sol-svg {
  width: 100%;
  height: 120px;
  display: block;
}

/* Sur mobile paysage (petit écran court), réduire la hauteur du sol */
@media (max-height: 499px) {
  .sol-svg {
    height: 70px;
  }
}
</style>
