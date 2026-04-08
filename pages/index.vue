<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Page principale - composition globale du portfolio

import { defineAsyncComponent, onMounted } from 'vue'
import SceneBackground from '~/components/scene/SceneBackground.vue'
import SceneLighting from '~/components/scene/SceneLighting.vue'
import WeatherLayer from '~/components/weather/WeatherLayer.vue'
import TreeCanvas from '~/components/tree/TreeCanvas.vue'
import WeatherIndicator from '~/components/WeatherIndicator.vue'
import PortfolioTitle from '~/components/ui/PortfolioTitle.vue'
import DotGrid from '~/components/ui/DotGrid.vue'
import ScanLines from '~/components/ui/ScanLines.vue'
import FloatingCode from '~/components/ui/FloatingCode.vue'
import SonarPing from '~/components/ui/SonarPing.vue'
import LangToggle from '~/components/ui/LangToggle.vue'
import { useWeather } from '~/composables/useWeather'
import { useLocaleStore } from '~/stores/locale'
import { useLocale } from '~/composables/useLocale'

// ─── Composants client-only (canvas, timers, stores réactifs) ─────────────────

const Constellation   = defineAsyncComponent(() => import('~/components/ui/Constellation.vue'))
const PixelBirds      = defineAsyncComponent(() => import('~/components/ui/PixelBirds.vue'))
const CommitLog       = defineAsyncComponent(() => import('~/components/ui/CommitLog.vue'))
const StatusBar       = defineAsyncComponent(() => import('~/components/ui/StatusBar.vue'))
const KeyboardHints   = defineAsyncComponent(() => import('~/components/ui/KeyboardHints.vue'))

// ─── Modales - chargement asynchrone (code splitting) ────────────────────────

const ModalProfil     = defineAsyncComponent(() => import('~/components/modals/ModalProfil.vue'))
const ModalExperience = defineAsyncComponent(() => import('~/components/modals/ModalExperience.vue'))
const ModalDiplomes   = defineAsyncComponent(() => import('~/components/modals/ModalDiplomes.vue'))
const ModalStack      = defineAsyncComponent(() => import('~/components/modals/ModalStack.vue'))
const ModalProjets    = defineAsyncComponent(() => import('~/components/modals/ModalProjets.vue'))
const ModalPassions   = defineAsyncComponent(() => import('~/components/modals/ModalPassions.vue'))
const ModalContact    = defineAsyncComponent(() => import('~/components/modals/ModalContact.vue'))

// ─── Démarrage météo + locale ─────────────────────────────────────────────────

useWeather()
useLocaleStore().initLocale()
const { t } = useLocale()

// ─── Easter egg console ───────────────────────────────────────────────────────

onMounted(() => {
  console.log(
    '\n%c GUERRIN FLORIAN %c\n',
    'background: #1e40af; color: #e0e7ff; font-size: 13px; font-weight: 800; padding: 5px 12px; border-radius: 4px; letter-spacing: 0.05em;',
    ''
  )
  console.log(
    '%c Full-Stack Developer  ·  Vue.js  ·  TypeScript  ·  SQL Server  ·  Docker',
    'color: #60a5fa; font-weight: 600; font-size: 11px;'
  )
  console.log(
    '%c Alternance @ Saarstahl Rail  —  Moselle, France',
    'color: #94a3b8; font-size: 11px;'
  )
  console.log(
    '\n%c 👋  Tu inspectes le code ? Bonne initiative.',
    'color: #a78bfa; font-style: italic; font-size: 11px;'
  )
  console.log(
    '%c    Ce portfolio est fait avec Nuxt 3, Vue 3, TypeScript strict, GSAP & Canvas API.',
    'color: #64748b; font-size: 10px;'
  )
  console.log(
    '\n%c → florian-guerrin.fr  |  guerrinflorian@yahoo.com\n',
    'color: #22d3ee; font-weight: 700; font-size: 12px;'
  )
})

// ─── SEO + Schema JSON-LD ─────────────────────────────────────────────────────

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Florian Guerrin',
        jobTitle: 'Developpeur Full-Stack',
        url: 'https://florian-guerrin.fr',
        email: 'guerrinflorian@yahoo.com',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Tressange',
          addressRegion: 'Moselle',
          addressCountry: 'FR',
        },
        knowsAbout: ['Vue.js', 'TypeScript', 'SQL Server', 'Nuxt 3', 'Docker', 'Node.js'],
        sameAs: ['https://github.com/guerrinflorian'],
      }),
    },
  ],
})
</script>

<template>
  <main class="scene" role="main" aria-label="Portfolio de Florian Guerrin">

    <!-- Couche 0 : fond ciel -->
    <SceneBackground />

    <!-- Couche 1 : titre filigrane + grille de points (derrière tout) -->
    <PortfolioTitle />
    <DotGrid />

    <!-- Couche 1 : constellations nocturnes (canvas, client only) -->
    <ClientOnly>
      <Constellation />
    </ClientOnly>

    <!-- Couche 1 : lumière ambiante CSS -->
    <SceneLighting />

    <!-- Couche 2 : fragments de code flottants -->
    <FloatingCode />

    <!-- Couche 2 : effets météo Canvas -->
    <ClientOnly>
      <WeatherLayer />
    </ClientOnly>

    <!-- Couche 3 : l'arbre - pièce maîtresse -->
    <ClientOnly>
      <TreeCanvas />
    </ClientOnly>

    <!-- Couche 3 : sonar ping depuis la base de l'arbre -->
    <SonarPing />

    <!-- Couche 4 : oiseaux pixel (weather-dependent) -->
    <ClientOnly>
      <PixelBirds />
    </ClientOnly>

    <!-- Couche 4 : scan lines CRT subtil (au-dessus de tout sauf modales) -->
    <ScanLines />

    <!-- UI layer : indicateur météo coin haut droit -->
    <WeatherIndicator />

    <!-- UI layer : bouton langue FR / EN -->
    <LangToggle />

    <!-- UI layer : journal de commits coin haut gauche -->
    <ClientOnly>
      <CommitLog />
    </ClientOnly>

    <!-- UI layer : barre de statut VS Code en bas -->
    <ClientOnly>
      <StatusBar />
    </ClientOnly>

    <!-- UI layer : raccourcis clavier -->
    <ClientOnly>
      <KeyboardHints />
    </ClientOnly>

    <!-- Modales (lazy-loaded) -->
    <ClientOnly>
      <ModalProfil />
      <ModalExperience />
      <ModalDiplomes />
      <ModalStack />
      <ModalProjets />
      <ModalPassions />
      <ModalContact />
    </ClientOnly>

    <!-- Instruction d'interaction - visible uniquement jusqu'à la première modale ouverte -->
    <div class="interaction-hint" aria-live="polite">
      <p>{{ t('Clique sur les branches de l\'arbre', 'Click on the tree branches') }}</p>
    </div>

  </main>
</template>

<style>
/* Styles globaux de la page */

.scene {
  width: 100vw;
  height: 100dvh;
  overflow: hidden;
  position: relative;
}

/* Hint d'interaction - au-dessus de la status bar */
.interaction-hint {
  position: fixed;
  bottom: 5.5rem;    /* au-dessus de la kb-bar + StatusBar */
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  padding: 0.5rem 1.25rem;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 99px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  font-weight: 500;
  white-space: nowrap;
  pointer-events: none;
  animation:
    fadeIn  1s ease 2s   both,
    fadeOut 1s ease 10s  both;
}

@media (max-width: 639px) {
  .interaction-hint {
    bottom: 4.5rem;
    font-size: 0.72rem;
    padding: 0.4rem 1rem;
  }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to   { opacity: 1; transform: translateX(-50%) translateY(0); }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to   { opacity: 0; }
}
</style>
