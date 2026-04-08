<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Diplômes et formations CESI

import { computed } from 'vue'
import ModalBase from './ModalBase.vue'
import TimelineLine from '../ui/TimelineLine.vue'
import { useModalStore } from '~/stores/modal'
import { useLocale } from '~/composables/useLocale'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'diplomes',
  set: (lVal) => { if (!lVal) mStore.close() },
})

const { t, locale } = useLocale()

// ─── Données formations ───────────────────────────────────────────────────────

const mDiplomes = computed(() => locale.value === 'fr' ? mDiplomesFR : mDiplomesEN)

const mDiplomesFR = [
  {
    id: 'maalsi',
    title: 'Manager en Architecture et Applications Logicielles des SI',
    subtitle: 'CESI Nancy · Bac+5 (Niveau 7)',
    period: 'Septembre 2025 → Septembre 2027',
    location: 'Nancy, Meurthe-et-Moselle',
    description: 'En alternance chez Saarstahl Rail. Architecture logicielle, management, gouvernance SI, DevOps, microservices, cloud et conduite du changement.',
    tags: ['Architecture', 'Management', 'DevOps', 'Microservices', 'Cloud', 'Agile'],
  },
  {
    id: 'cda',
    title: 'Concepteur Développeur d\'Applications',
    subtitle: 'CESI Nancy · Bac+3 (Niveau 6)',
    period: '2024 → 2025',
    location: 'Nancy, Meurthe-et-Moselle',
    description: 'En alternance chez Saarstahl Rail. Conception UML, design patterns, API REST, tests, CI/CD, Docker et méthodes Agile.',
    tags: ['UML', 'Design Patterns', 'API REST', 'Docker', 'CI/CD', 'Scrum'],
  },
  {
    id: 'dev-info',
    title: 'Développeur Informatique',
    subtitle: 'CESI Nancy · Bac+2 (Niveau 5)',
    period: 'Octobre 2022 → 2024',
    location: 'Nancy, Meurthe-et-Moselle',
    description: 'En alternance chez Saarstahl Rail. Développement front et back, bases de données relationnelles, SQL, procédures stockées, webservices.',
    tags: ['Vue.js', 'SQL Server', 'VB.NET', 'Git', 'Algorithmique'],
  },
]

const mDiplomesEN = [
  {
    id: 'maalsi',
    title: 'Software Architecture & IS Applications Manager',
    subtitle: 'CESI Nancy · Master\'s equivalent (Level 7)',
    period: 'September 2025 → September 2027',
    location: 'Nancy, France',
    description: 'Work-study at Saarstahl Rail. Software architecture, team management, IS governance, DevOps, microservices, cloud and change management.',
    tags: ['Architecture', 'Management', 'DevOps', 'Microservices', 'Cloud', 'Agile'],
  },
  {
    id: 'cda',
    title: 'Application Designer & Developer',
    subtitle: 'CESI Nancy · Bachelor\'s equivalent (Level 6)',
    period: '2024 → 2025',
    location: 'Nancy, France',
    description: 'Work-study at Saarstahl Rail. UML design, design patterns, REST APIs, testing, CI/CD, Docker and Agile methods.',
    tags: ['UML', 'Design Patterns', 'REST API', 'Docker', 'CI/CD', 'Scrum'],
  },
  {
    id: 'dev-info',
    title: 'IT Developer',
    subtitle: 'CESI Nancy · Associate\'s equivalent (Level 5)',
    period: 'October 2022 → 2024',
    location: 'Nancy, France',
    description: 'Work-study at Saarstahl Rail. Front-end and back-end development, relational databases, SQL, stored procedures and webservices.',
    tags: ['Vue.js', 'SQL Server', 'VB.NET', 'Git', 'Algorithms'],
  },
]
</script>

<template>
  <ModalBase v-model="mOuverte" :title="t('Formation', 'Education')">
    <TimelineLine :items="mDiplomes" />
  </ModalBase>
</template>
