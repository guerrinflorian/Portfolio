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
      'Architecture SQL Server autonome : tables, procédures stockées (CRUD), vues et synonymes pour faciliter le déploiement',
      'Pilotage des tâches via Microsoft Planner, suivi du temps sur outil interne, participation aux réunions d\'analyse, rédaction de specs et recettes',
      'Force de proposition : implémentation d\'un linter dès le début de l\'alternance, accompagnement de la migration d\'architecture complète (.aspx / Vue 2 / TFS / jQuery → Vue 3 / Pinia / GitHub / VSCode)',
      'Encadrement de stagiaires : accompagnement technique et revues de code',
    ],
  },
  {
    id: 'micro-entreprise',
    title: 'Développeur Web & Applications métier',
    subtitle: 'Auto-entrepreneur',
    period: 'Septembre 2025 → Aujourd\'hui',
    location: 'Bure / Tressange, Moselle',
    tags: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Node.js', 'Docker', 'Supabase', 'VPS'],
    points: [
      'Conception et développement de sites web et applications métier sur-mesure pour des clients variés',
      'Sites vitrines, interfaces d\'administration, intégrations back-end, déploiements sur VPS',
      'Missions menées en parallèle de l\'alternance Saarstahl Rail',
    ],
    links: [
      { label: 'lehubduweb.fr',     href: 'https://www.lehubduweb.fr' },
      { label: 'florian-guerrin.fr', href: 'https://florian-guerrin.fr' },
    ],
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
      'Autonomous SQL Server architecture: tables, stored procedures (CRUD), views and synonyms to simplify deployment',
      'Task management via Microsoft Planner, time tracking on internal tool, involvement in analysis meetings, spec writing and acceptance testing',
      'Driving initiative: implemented a linter from day one of the apprenticeship, led the full architecture migration (.aspx / Vue 2 / TFS / jQuery → Vue 3 / Pinia / GitHub / VSCode)',
      'Mentoring interns: technical guidance and code reviews',
    ],
  },
  {
    id: 'micro-entreprise',
    title: 'Web & Business App Developer',
    subtitle: 'Freelance',
    period: 'September 2025 → Present',
    location: 'Bure / Tressange, Moselle, France',
    tags: ['Vue 3', 'Nuxt 3', 'TypeScript', 'Node.js', 'Docker', 'Supabase', 'VPS'],
    points: [
      'Design and development of custom websites and business applications for various clients',
      'Landing pages, admin interfaces, back-end integrations, VPS deployments',
      'Projects carried out alongside the Saarstahl Rail apprenticeship',
    ],
    links: [
      { label: 'lehubduweb.fr',     href: 'https://www.lehubduweb.fr' },
      { label: 'florian-guerrin.fr', href: 'https://florian-guerrin.fr' },
    ],
  },
]
</script>

<template>
  <ModalBase v-model="mOuverte" :title="t('Expérience', 'Experience')">
    <TimelineLine :items="mExperiences" />
  </ModalBase>
</template>
