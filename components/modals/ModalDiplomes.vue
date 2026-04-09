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
    description: 'En alternance chez Saarstahl Rail. Conception d\'architectures logicielles complexes (microservices, Serverless) et infrastructures Cloud scalables. Pipelines CI/CD industriels, IaC et DevSecOps. Élaboration de schémas directeurs, alignement IT/métier et gestion des risques. Pilotage d\'équipes et projets complexes avec frameworks agiles à l\'échelle.',
    tags: ['Architecture', 'Cloud', 'DevOps', 'DevSecOps', 'Management', 'Gouvernance SI'],
  },
  {
    id: 'cda',
    title: 'Concepteur Développeur d\'Applications',
    subtitle: 'CESI Nancy · Bac+3 (Niveau 6)',
    period: '2024 → 2025',
    location: 'Nancy, Meurthe-et-Moselle',
    description: 'En alternance chez Saarstahl Rail. Modélisation UML et design patterns pour assurer la maintenabilité du code. Création et documentation (Swagger/OpenAPI) d\'API RESTful sécurisées. Conteneurisation Docker, tests automatisés (unitaires et intégration) et CI/CD. Méthodes Agile (Scrum/Kanban) en équipe pluridisciplinaire.',
    tags: ['UML', 'Design Patterns', 'API REST', 'Swagger', 'Docker', 'CI/CD', 'Scrum'],
  },
  {
    id: 'dev-info',
    title: 'Développeur Informatique',
    subtitle: 'CESI Nancy · Bac+2 (Niveau 5)',
    period: 'Octobre 2022 → 2024',
    location: 'Nancy, Meurthe-et-Moselle',
    description: 'En alternance chez Saarstahl Rail. Conception et développement d\'applications web complètes (front-end interactif et back-end robuste). Modélisation conceptuelle et physique de données, SQL avancé et procédures stockées. Consommation de webservices et manipulation de flux de données (JSON, XML).',
    tags: ['Full-Stack', 'SQL avancé', 'Procédures stockées', 'Webservices', 'JSON/XML'],
  },
]

const mDiplomesEN = [
  {
    id: 'maalsi',
    title: 'Software Architecture & IS Applications Manager',
    subtitle: 'CESI Nancy · Master\'s equivalent (Level 7)',
    period: 'September 2025 → September 2027',
    location: 'Nancy, France',
    description: 'Work-study at Saarstahl Rail. Designing complex software architectures (microservices, Serverless) and scalable cloud infrastructures. Industrial CI/CD pipelines, IaC and DevSecOps. IT roadmaps, IT/business alignment and risk management. Team leadership and complex projects with scaled agile frameworks.',
    tags: ['Architecture', 'Cloud', 'DevOps', 'DevSecOps', 'Management', 'IS Governance'],
  },
  {
    id: 'cda',
    title: 'Application Designer & Developer',
    subtitle: 'CESI Nancy · Bachelor\'s equivalent (Level 6)',
    period: '2024 → 2025',
    location: 'Nancy, France',
    description: 'Work-study at Saarstahl Rail. UML modelling and design patterns for code maintainability. Creating and documenting (Swagger/OpenAPI) secured RESTful APIs. Docker containerisation, automated testing (unit and integration) and CI/CD. Agile methods (Scrum/Kanban) in a multidisciplinary team.',
    tags: ['UML', 'Design Patterns', 'REST API', 'Swagger', 'Docker', 'CI/CD', 'Scrum'],
  },
  {
    id: 'dev-info',
    title: 'IT Developer',
    subtitle: 'CESI Nancy · Associate\'s equivalent (Level 5)',
    period: 'October 2022 → 2024',
    location: 'Nancy, France',
    description: 'Work-study at Saarstahl Rail. Designing and developing complete web applications (interactive front-end and robust back-end). Conceptual and physical data modelling, advanced SQL and stored procedures. External web service consumption and data stream processing (JSON, XML).',
    tags: ['Full-Stack', 'Advanced SQL', 'Stored procedures', 'Webservices', 'JSON/XML'],
  },
]
</script>

<template>
  <ModalBase v-model="mOuverte" :title="t('Formation', 'Education')">
    <TimelineLine :items="mDiplomes" />
  </ModalBase>
</template>
