<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Modale - Diplômes et formations CESI

import { computed } from 'vue'
import ModalBase from './ModalBase.vue'
import TimelineLine from '../ui/TimelineLine.vue'
import { useModalStore } from '~/stores/modal'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'diplomes',
  set: (lVal) => { if (!lVal) mStore.close() },
})

// ─── Données formations CESI ──────────────────────────────────────────────────

const mDiplomes = [
  {
    id: 'maalsi',
    title: 'Manager en Architecture et Applications Logicielles des SI',
    subtitle: 'CESI Nancy · Bac+5 (Niveau 7)',
    period: 'Septembre 2025 → Septembre 2027',
    location: 'Nancy, Meurthe-et-Moselle',
    description: 'En alternance chez Saarstahl Rail. Architecture logicielle, management d\'équipes, gouvernance SI, DevOps, microservices, cloud, conduite du changement.',
    tags: ['Architecture', 'Management', 'DevOps', 'Microservices', 'Cloud', 'Agile avancé'],
  },
  {
    id: 'cda',
    title: 'Concepteur Développeur d\'Applications (CDA)',
    subtitle: 'CESI Nancy · Bac+3 (Niveau 6)',
    period: '2024 → 2025',
    location: 'Nancy, Meurthe-et-Moselle',
    description: 'En alternance chez Saarstahl Rail. Conception UML, design patterns, architecture MVC/MVVM, API REST, tests, CI/CD, Docker, Agile/Scrum.',
    tags: ['UML', 'Design Patterns', 'API REST', 'Docker', 'CI/CD', 'Scrum'],
  },
  {
    id: 'dev-info',
    title: 'Développeur Informatique',
    subtitle: 'CESI Nancy · Bac+2 (Niveau 5)',
    period: 'Octobre 2022 → 2024',
    location: 'Nancy, Meurthe-et-Moselle',
    description: 'En alternance chez Saarstahl Rail. Développement front/back, bases de données relationnelles, SQL avancé, procédures stockées, webservices.',
    tags: ['Vue.js', 'SQL Server', 'VB.NET', 'Git', 'Algorithmique'],
  },
]
</script>

<template>
  <ModalBase v-model="mOuverte" title="Formation">
    <TimelineLine :items="mDiplomes" />
  </ModalBase>
</template>
