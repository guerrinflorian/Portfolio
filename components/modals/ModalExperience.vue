<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Expériences professionnelles

import { computed } from 'vue'
import ModalBase from './ModalBase.vue'
import TimelineLine from '../ui/TimelineLine.vue'
import { useModalStore } from '~/stores/modal'
import { useLocale } from '~/composables/useLocale'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'experience',
  set: (lVal) => { if (!lVal) mStore.close() },
})

const { t, locale } = useLocale()

// ─── Données expériences ──────────────────────────────────────────────────────

const mExperiences = computed(() => locale.value === 'fr' ? mExperiencesFR : mExperiencesEN)

const mExperiencesFR = [
  {
    id: 'saarstahl-rail',
    title: 'Développeur IT Applicatif',
    subtitle: 'Saarstahl Rail · Alternance',
    period: 'Octobre 2022 → Aujourd\'hui',
    location: 'Hayange / Tressange, Moselle',
    tags: ['Vue 3', 'Vue 2', 'TypeScript', 'VB.NET', 'SQL Server', 'Pinia', 'DevExtreme', 'GitHub', 'TFS'],
    points: [
      'Développement d\'applications métier sur l\'intranet : gestion de production ferroviaire de la commande à l\'expédition (wagons et camions), priorisation des chargements, fusions, transferts et logique métier avancée',
      'Mise en place de la nouvelle architecture technique : migration de pages .aspx avec Vue 2 et TFS vers une Single Page Application Vue 3, Pinia et GitHub',
      'Développement de routes et controllers en VB.NET/ASP.NET sur les webservices existants',
      'SQL Server : écriture et modification de procédures stockées, création de tables pensées pour être flexibles à long terme',
      'Participation à l\'analyse des besoins avec les équipes usine, rédaction de specs, découpage et suivi des tâches via Microsoft Planner',
      'Encadrement de stagiaires : revues de code, accompagnement technique, normes TypeScript strict',
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

const mExperiencesEN = [
  {
    id: 'saarstahl-rail',
    title: 'IT Application Developer',
    subtitle: 'Saarstahl Rail · Apprenticeship',
    period: 'October 2022 → Present',
    location: 'Hayange / Tressange, Moselle, France',
    tags: ['Vue 3', 'Vue 2', 'TypeScript', 'VB.NET', 'SQL Server', 'Pinia', 'DevExtreme', 'GitHub', 'TFS'],
    points: [
      'Developing business applications on the company intranet: railway production management from order to shipment (wagons and trucks), load prioritization, merges, transfers and complex business logic',
      'Led the new architecture rollout: migration from .aspx pages with Vue 2 and TFS to a Single Page Application with Vue 3, Pinia and GitHub',
      'Developing routes and controllers in VB.NET/ASP.NET on existing webservices',
      'SQL Server: writing and modifying stored procedures, designing tables built for long-term flexibility',
      'Participating in requirements analysis with factory teams, writing specs, task breakdown and tracking via Microsoft Planner',
      'Mentoring interns: code reviews, technical guidance, TypeScript strict standards',
    ],
  },
  {
    id: 'micro-entreprise',
    title: 'Web & Business App Developer',
    subtitle: 'Freelance',
    period: 'September 2025 → Present',
    location: 'Tressange, Moselle, France',
    tags: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Node.js', 'Docker'],
    points: [
      'Building custom websites and business applications for clients',
      'Freelance projects alongside the Saarstahl Rail apprenticeship',
    ],
    url: 'https://www.lehubduweb.fr',
  },
]
</script>

<template>
  <ModalBase v-model="mOuverte" :title="t('Expérience', 'Experience')">
    <TimelineLine :items="mExperiences" />
  </ModalBase>
</template>
