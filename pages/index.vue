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
import { useLocale } from '~/composables/useLocale'

// ─── Composants client-only (canvas, timers, stores réactifs) ─────────────────

const Constellation   = defineAsyncComponent(() => import('~/components/ui/Constellation.vue'))
const PixelBirds      = defineAsyncComponent(() => import('~/components/ui/PixelBirds.vue'))
const CommitLog       = defineAsyncComponent(() => import('~/components/ui/CommitLog.vue'))
const StatusBar       = defineAsyncComponent(() => import('~/components/ui/StatusBar.vue'))
const KeyboardHints   = defineAsyncComponent(() => import('~/components/ui/KeyboardHints.vue'))
const CodeEcho        = defineAsyncComponent(() => import('~/components/ui/CodeEcho.vue'))

// ─── Modales - chargement asynchrone (code splitting) ────────────────────────

const ModalProfil     = defineAsyncComponent(() => import('~/components/modals/ModalProfil.vue'))
const ModalExperience = defineAsyncComponent(() => import('~/components/modals/ModalExperience.vue'))
const ModalDiplomes   = defineAsyncComponent(() => import('~/components/modals/ModalDiplomes.vue'))
const ModalStack      = defineAsyncComponent(() => import('~/components/modals/ModalStack.vue'))
const ModalProjets    = defineAsyncComponent(() => import('~/components/modals/ModalProjets.vue'))
const ModalPassions   = defineAsyncComponent(() => import('~/components/modals/ModalPassions.vue'))
const ModalContact      = defineAsyncComponent(() => import('~/components/modals/ModalContact.vue'))
const ModalTypingRace   = defineAsyncComponent(() => import('~/components/modals/ModalTypingRace.vue'))

import SceneCabin from '~/components/scene/SceneCabin.vue'
import ScenePlanes from '~/components/scene/ScenePlanes.vue'

// ─── Démarrage météo + locale ─────────────────────────────────────────────────

useWeather()
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
    '%c Alternance @ Saarstahl Rail - Moselle, France',
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

const lAreaServed = [
  // Moselle - France
  'Tressange', 'Bure', 'Hayange', 'Thionville', 'Florange', 'Fameck', 'Nilvange',
  'Knutange', 'Yutz', 'Algrange', 'Fontoy', 'Amnéville', 'Uckange', 'Illange',
  'Metz', 'Cattenom', 'Briey', 'Longwy', 'Rombas',
  // Luxembourg
  'Esch-sur-Alzette', 'Dudelange', 'Differdange', 'Pétange', 'Schifflange',
  'Bettembourg', 'Mondercange', 'Sanem',
]

useHead({
  script: [
    // Schema 1 : ProfessionalService (qui il est, où, zone)
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': ['LocalBusiness', 'ProfessionalService'],
        name: 'Florian Guerrin - Développeur Full-Stack',
        url: 'https://florian-guerrin.fr',
        email: 'guerrinflorian@yahoo.com',
        image: 'https://florian-guerrin.fr/og-image.png',
        priceRange: '€€',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Tressange',
          addressLocality: 'Tressange',
          postalCode: '57710',
          addressRegion: 'Moselle',
          addressCountry: 'FR',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 49.358,
          longitude: 6.185,
        },
        areaServed: lAreaServed,
        knowsAbout: ['Développement web', 'Applications métier', 'Front-end', 'Back-end', 'API REST', 'Infrastructure VPS'],
        sameAs: ['https://github.com/guerrinflorian'],
        description: 'Développeur full-stack freelance basé à Tressange (Moselle), à 5 min de la frontière luxembourgeoise. Création d\'applications web et métier pour PME, industries et startups en Moselle et au Luxembourg.',
      }),
    },

    // Schema 2 : Service (ce qu'il propose)
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Service',
        serviceType: 'Développement web et applications métier sur mesure',
        name: 'Développement web freelance - Florian Guerrin',
        description: 'Création d\'applications web, interfaces métier, API et infrastructure pour entreprises en Moselle et au Luxembourg. Disponible en régie ou forfait.',
        provider: {
          '@type': 'Person',
          name: 'Florian Guerrin',
          url: 'https://florian-guerrin.fr',
        },
        areaServed: lAreaServed,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Prestations de développement',
          itemListElement: [
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Création d\'application web sur mesure' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Développement d\'application métier (intranet, ERP)' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Développement API REST et intégrations' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Infrastructure et déploiement VPS' } },
            { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Audit et refonte technique d\'application existante' } },
          ],
        },
      }),
    },

    // Schema 3 : FAQPage (questions géolocalisées pour l'AEO / IA)
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Où trouver un développeur web freelance en Moselle ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Florian Guerrin est développeur full-stack freelance basé à Tressange (57710), en Moselle. Il intervient dans un rayon de 20 km autour de Bure et Tressange, couvrant Thionville, Hayange, Florange, Fameck et les communes frontalières du Luxembourg (Esch-sur-Alzette, Dudelange, Pétange).',
            },
          },
          {
            '@type': 'Question',
            name: 'Y a-t-il un développeur freelance disponible près de Thionville ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Oui. Florian Guerrin, développeur full-stack basé à Tressange, se trouve à moins de 10 minutes de Thionville. Il propose des prestations de développement web et d\'applications métier pour les entreprises de la zone Thionville, Hayange, Yutz et Florange.',
            },
          },
          {
            '@type': 'Question',
            name: 'Un développeur web français intervient-il pour des entreprises au Luxembourg ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Oui. Situé à 5 minutes de la frontière luxembourgeoise, Florian Guerrin accepte les missions pour des sociétés basées au Luxembourg, notamment à Esch-sur-Alzette, Dudelange, Differdange et Pétange. Frontalier potentiel, il est disponible en régie sur site ou en télétravail.',
            },
          },
          {
            '@type': 'Question',
            name: 'Quels services propose un développeur freelance en Moselle ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Florian Guerrin propose : création d\'applications web et métier sur mesure, développement front-end et back-end, mise en place d\'API REST, déploiement et gestion d\'infrastructure VPS, et accompagnement technique de projets. Il intervient pour des PME, industries et startups en Moselle et au Luxembourg.',
            },
          },
          {
            '@type': 'Question',
            name: 'Quel est le délai pour créer une application web en Moselle ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Pour un projet web standard (site ou application métier simple), le délai est généralement de 3 à 8 semaines. Une application métier complexe nécessite en moyenne 2 à 4 mois selon le périmètre fonctionnel. Un premier échange permet d\'établir un devis et un planning précis.',
            },
          },
          {
            '@type': 'Question',
            name: 'Florian Guerrin développeur est-il disponible près de Metz ?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Florian Guerrin est basé en Moselle, à environ 30 km de Metz. Il intervient en télétravail pour tout projet dans la région Grand Est, et peut se déplacer ponctuellement sur Metz selon les besoins du projet.',
            },
          },
        ],
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

    <!-- Couche 4 : l'arbre - pièce maîtresse -->
    <ClientOnly>
      <TreeCanvas />
    </ClientOnly>

    <!-- Couche 5 : avions en temps réel (60km autour de Bure, tooltip au survol) -->
    <ClientOnly>
      <ScenePlanes />
    </ClientOnly>

    <!-- Couche 3 : cabane mini-jeu (desktop uniquement) -->
    <ClientOnly>
      <SceneCabin />
    </ClientOnly>

    <!-- Couche 3 : sonar ping depuis la base de l'arbre -->
    <SonarPing />

    <!-- Couche 4 : oiseaux pixel (weather-dependent) -->
    <ClientOnly>
      <PixelBirds />
    </ClientOnly>

    <!-- Couche 4 : scan lines CRT subtil (au-dessus de tout sauf modales) -->
    <ScanLines />

    <!-- Couche 6 : echo de code au curseur -->
    <ClientOnly>
      <CodeEcho />
    </ClientOnly>

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
      <ModalTypingRace />
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
