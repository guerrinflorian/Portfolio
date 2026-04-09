<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant - titre portfolio géant en filigrane, derrière l'arbre

import { ref, onMounted, onUnmounted } from 'vue'

const mGlitching = ref(false)

let mTimerLoop: ReturnType<typeof setTimeout> | null = null

function mScheduleGlitch(): void {
  // Déclenche un glitch aléatoirement toutes les 6 à 14 secondes
  const lDelay = 6000 + Math.random() * 8000
  mTimerLoop = setTimeout(() => {
    mGlitching.value = true
    setTimeout(() => {
      mGlitching.value = false
      mScheduleGlitch()
    }, 500)
  }, lDelay)
}

onMounted(() => { mScheduleGlitch() })
onUnmounted(() => { if (mTimerLoop) clearTimeout(mTimerLoop) })
</script>

<template>
  <div class="portfolio-title" :class="{ 'portfolio-title--glitch': mGlitching }" aria-hidden="true">
    <div class="portfolio-title-name" data-text="GUERRIN">GUERRIN</div>
    <div class="portfolio-title-firstname" data-text="FLORIAN">FLORIAN</div>
    <div class="portfolio-title-role">FULL-STACK DEVELOPER</div>
  </div>
</template>

<style scoped>
.portfolio-title {
  position: fixed;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1;
  user-select: none;
  padding-bottom: 10vh;
}

.portfolio-title-name,
.portfolio-title-firstname {
  position: relative;
  font-size: clamp(3.5rem, 13vw, 11rem);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.28em;
  line-height: 0.95;
  font-family: var(--font-sans);
  color: rgba(255, 255, 255, 0.16);
  text-align: center;
}

.portfolio-title-name::before,
.portfolio-title-name::after,
.portfolio-title-firstname::before,
.portfolio-title-firstname::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  text-align: center;
  overflow: hidden;
  opacity: 0;
}

/* Couche rouge - décalée à gauche */
.portfolio-title-name::before,
.portfolio-title-firstname::before {
  color: rgba(255, 80, 80, 0.18);
  transform: translateX(-3px);
}

/* Couche bleue - décalée à droite */
.portfolio-title-name::after,
.portfolio-title-firstname::after {
  color: rgba(80, 120, 255, 0.18);
  transform: translateX(3px);
}

/* Déclenchement via classe JS */
.portfolio-title--glitch .portfolio-title-name::before,
.portfolio-title--glitch .portfolio-title-firstname::before {
  animation: glitch-before 0.45s steps(3) forwards;
  opacity: 1;
}

.portfolio-title--glitch .portfolio-title-name::after,
.portfolio-title--glitch .portfolio-title-firstname::after {
  animation: glitch-after 0.45s steps(3) forwards;
  opacity: 1;
}

@keyframes glitch-before {
  0%   { clip-path: inset(15% 0 70% 0); transform: translateX(-4px); }
  25%  { clip-path: inset(60% 0 10% 0); transform: translateX(-2px); }
  50%  { clip-path: inset(30% 0 50% 0); transform: translateX(-5px); }
  75%  { clip-path: inset(80% 0 5%  0); transform: translateX(-3px); }
  100% { clip-path: inset(0% 0 100% 0); transform: translateX(0);    opacity: 0; }
}

@keyframes glitch-after {
  0%   { clip-path: inset(70% 0 5%  0); transform: translateX(4px);  }
  25%  { clip-path: inset(10% 0 75% 0); transform: translateX(3px);  }
  50%  { clip-path: inset(50% 0 30% 0); transform: translateX(5px);  }
  75%  { clip-path: inset(5%  0 85% 0); transform: translateX(2px);  }
  100% { clip-path: inset(0% 0 100% 0); transform: translateX(0);    opacity: 0; }
}

.portfolio-title-firstname {
  color: rgba(255, 255, 255, 0.11);
  margin-top: 0.06em;
}

.portfolio-title-role {
  font-size: clamp(0.55rem, 1.4vw, 0.9rem);
  font-weight: 600;
  letter-spacing: 0.65em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.32);
  font-family: var(--font-mono);
  margin-top: 0.9em;
  text-align: center;
}
</style>
