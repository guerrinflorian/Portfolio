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
    location: 'Hayange / Bure - Tressange, Moselle',
    tags: ['Vue 2', 'Vue 3', 'TypeScript', 'VB.NET', 'SQL Server', 'DevExtreme', 'jQuery', 'ASP.NET', 'Pinia', 'GitHub', 'TFS'],
    points: [
      'Développement fullstack en environnement hybride : Vue 2, jQuery, DevExtreme et ASP.NET (.aspx) côté front / controllers VB.NET, Web API REST et procédures stockées SQL Server côté back',
      'Conception et livraison de plusieurs applications intranet complètes : gestion des tickets informatiques avec dashboard, tableau de bord de production (15+ graphiques, croix de sécurité utilisée par les RH), coffre-fort de mots de passe d\'entreprise',
      'Application de gestion de production ferroviaire de bout en bout : réception des commandes, création et priorisation des chargements, actions métier (transferts, fusions, changements d\'état), regroupement en expéditions',
      'Architecture SQL Server autonome : modélisation des tables, procédures stockées (CRUD, calculs, filtres complexes), vues, synonymes cross-environnements et optimisation de requêtes (plans d\'exécution, index)',
      'Pilotage des tâches via Microsoft Planner, suivi du temps sur outil interne, participation aux réunions d\'analyse, rédaction de specs et recettes',
      'Force de proposition : implémentation d\'un linter dès le début de l\'alternance, accompagnement de la migration d\'architecture complète (.aspx / Vue 2 / TFS / jQuery → Vue 3 / Pinia / GitHub / VSCode)',
      'Encadrement de stagiaires : revues de code, accompagnement technique, application des standards TypeScript strict',
    ],
  },
  {
    id: 'micro-entreprise',
    title: 'Développeur Web & Applications métier',
    subtitle: 'Auto-entrepreneur',
    period: 'Septembre 2025 → Aujourd\'hui',
    location: 'Bure / Tressange, Moselle',
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
    location: 'Hayange / Bure - Tressange, Moselle, France',
    tags: ['Vue 2', 'Vue 3', 'TypeScript', 'VB.NET', 'SQL Server', 'DevExtreme', 'jQuery', 'ASP.NET', 'Pinia', 'GitHub', 'TFS'],
    points: [
      'Fullstack development in a hybrid environment: Vue 2, jQuery, DevExtreme and ASP.NET (.aspx) on the front / VB.NET controllers, REST Web API and SQL Server stored procedures on the back',
      'Design and delivery of multiple complete intranet applications: IT ticket management with dashboard, production dashboard (15+ charts, safety cross tracker used by HR), company-wide password vault',
      'End-to-end railway production management app: order intake, load creation and prioritisation, business actions (transfers, merges, status changes), shipment grouping',
      'Autonomous SQL Server architecture: table design, stored procedures (CRUD, calculations, complex filters), views, cross-environment synonyms and query optimisation (execution plans, indexes)',
      'Task management via Microsoft Planner, time tracking on internal tool, involvement in analysis meetings, spec writing and acceptance testing',
      'Driving initiative: implemented a linter from day one of the apprenticeship, led the full architecture migration (.aspx / Vue 2 / TFS / jQuery → Vue 3 / Pinia / GitHub / VSCode)',
      'Mentoring interns: code reviews, technical guidance, TypeScript strict standards',
    ],
  },
  {
    id: 'micro-entreprise',
    title: 'Web & Business App Developer',
    subtitle: 'Freelance',
    period: 'September 2025 → Present',
    location: 'Bure / Tressange, Moselle, France',
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
