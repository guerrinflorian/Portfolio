<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Expériences professionnelles

import { computed } from 'vue'
import ModalBase from './ModalBase.vue'
import TimelineLine from '../ui/TimelineLine.vue'
import { useModalStore } from '~/stores/modal'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'experience',
  set: (lVal) => { if (!lVal) mStore.close() },
})

// ─── Données expériences ──────────────────────────────────────────────────────

const mExperiences = [
  {
    id: 'saarstahl-rail',
    title: 'Développeur IT Applicatif',
    subtitle: 'Saarstahl Rail · Alternance',
    period: 'Octobre 2022 → Aujourd\'hui',
    location: 'Hayange / Tressange, Moselle',
    tags: ['Vue 3', 'Vue 2', 'TypeScript', 'VB.NET', 'SQL Server', 'Pinia', 'DevExtreme', 'GitHub', 'TFS'],
    points: [
      'Développement d\'une application métier intranet complexe : gestion de commandes ferroviaires, chargements, expéditions, suivi de production',
      'Logique métier avancée : verrous de ressources, workflows multi-états, règles métier usine en T-SQL (schéma cmdrail, base BDRMES)',
      'Procédures stockées SQL Server complexes, vues matérialisées, requêtes multi-jointures sur données industrielles',
      'Tableaux de bord et indicateurs de production temps réel, visualisation des flux de l\'usine',
      'Migration applications legacy bureau → intranet ; migration TFS → GitHub (stratégie de branches, CI/CD)',
      'Scaffolding architecture intranet Vue 3 / Vite / Pinia / Vue Router (template entreprise réutilisable)',
      'Développement de webservices VB.NET / ASP.NET WebForms côté legacy',
      'Encadrement de stagiaires (Bac+3 et plus), normes de code strictes Composition API + TypeScript strict',
      'Analyse des besoins métier, rédaction de spécifications, collaboration directe avec les équipes usine',
    ],
  },
  {
    id: 'micro-entreprise',
    title: 'Développeur Web & Applications métier',
    subtitle: 'Auto-entrepreneur',
    period: 'Septembre 2025 → Aujourd\'hui',
    location: 'Tressange, Moselle',
    tags: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Node.js', 'Docker'],
    points: [
      'Création et développement de sites web et applications métier sur-mesure pour clients',
      'Missions freelance en parallèle de l\'alternance Saarstahl Rail',
    ],
    url: 'https://www.lehubduweb.fr',
  },
]
</script>

<template>
  <ModalBase v-model="mOuverte" title="Expérience">
    <TimelineLine :items="mExperiences" />
  </ModalBase>
</template>
