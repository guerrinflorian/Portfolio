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
      'Développement d\'une grosse appli intranet pour gérer les commandes ferroviaires, les chargements et les expéditions',
      'Création et modification de procédures stockées SQL Server, requêtes complexes sur les données de production',
      'Tableaux de bord de suivi production en temps réel pour les équipes usine',
      'Migration d\'applis legacy bureau vers le web, passage de TFS à GitHub avec mise en place des branches',
      'Mise en place d\'une architecture Vue 3 / Vite / Pinia réutilisable pour les projets internes',
      'Dev de webservices côté legacy en VB.NET / ASP.NET',
      'Suivi de stagiaires, revues de code, normes TypeScript strict',
      'Recueil des besoins avec les équipes usine, rédaction de specs, suivi des livrables',
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
