<script setup lang="ts">
// Auteur : GUERRINF — Florian Guerrin
// Modale — Projets personnels avec vue détail intégrée

import { ref, computed } from 'vue'
import ModalBase from './ModalBase.vue'
import Tag from '../ui/Tag.vue'
import { useModalStore } from '~/stores/modal'
import type { Project, ProjectStatus, ProjectCategorie } from '~/types/modal'

const mStore = useModalStore()
const mOuverte = computed({
  get: () => mStore.activeModal === 'projets',
  set: (lVal) => { if (!lVal) mStore.close() },
})

// ─── Directive 3D tilt ────────────────────────────────────────────────────────

const vTilt = {
  mounted(el: HTMLElement) {
    if (!window.matchMedia('(pointer: fine)').matches) return

    function lOnEnter(): void {
      el.style.transition = 'transform 0.06s ease'
    }

    function lOnMove(e: MouseEvent): void {
      const lRect = el.getBoundingClientRect()
      const lRotY =  (((e.clientX - lRect.left) / lRect.width)  - 0.5) * 14
      const lRotX = -(((e.clientY - lRect.top)  / lRect.height) - 0.5) * 10
      el.style.transform = `perspective(700px) rotateX(${lRotX}deg) rotateY(${lRotY}deg) translateZ(6px)`
    }

    function lOnLeave(): void {
      el.style.transition = 'transform 0.45s ease'
      el.style.transform  = 'perspective(700px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
    }

    el.addEventListener('mouseenter', lOnEnter)
    el.addEventListener('mousemove',  lOnMove)
    el.addEventListener('mouseleave', lOnLeave)
    ;(el as any).__tiltCleanup = () => {
      el.removeEventListener('mouseenter', lOnEnter)
      el.removeEventListener('mousemove',  lOnMove)
      el.removeEventListener('mouseleave', lOnLeave)
    }
  },
  unmounted(el: HTMLElement) {
    ;(el as any).__tiltCleanup?.()
  },
}

// ─── Vue détail active ────────────────────────────────────────────────────────

const mDetailId = ref<string | null>(null)

function mOuvrirDetail(lId: string): void {
  mDetailId.value = lId
}

function mRetourListe(): void {
  mDetailId.value = null
  mLightboxIndex.value = null
}

// Titre dynamique selon la vue
const mTitreModal = computed(() =>
  mDetailId.value
    ? (mProjets.find(lP => lP.id === mDetailId.value)?.titre ?? 'Projet')
    : 'Projets personnels'
)

// ─── Lightbox ─────────────────────────────────────────────────────────────────

const mLightboxIndex = ref<number | null>(null)

function mOuvrirLightbox(lIdx: number): void {
  mLightboxIndex.value = lIdx
}
function mFermerLightbox(): void {
  mLightboxIndex.value = null
}
function mLightboxPrev(): void {
  const lShots = mDetailCourant.value?.screenshots
  if (!lShots || mLightboxIndex.value === null) return
  mLightboxIndex.value = (mLightboxIndex.value - 1 + lShots.length) % lShots.length
}
function mLightboxNext(): void {
  const lShots = mDetailCourant.value?.screenshots
  if (!lShots || mLightboxIndex.value === null) return
  mLightboxIndex.value = (mLightboxIndex.value + 1) % lShots.length
}

function mOnKeydown(lEvent: KeyboardEvent): void {
  if (mLightboxIndex.value === null) return
  if (lEvent.key === 'ArrowLeft')  { lEvent.stopPropagation(); mLightboxPrev() }
  if (lEvent.key === 'ArrowRight') { lEvent.stopPropagation(); mLightboxNext() }
  if (lEvent.key === 'Escape')     { lEvent.stopPropagation(); mFermerLightbox() }
}

// ─── Types détail ─────────────────────────────────────────────────────────────

interface Techno     { label: string; detail: string; color: string }
interface Feature    { icon: string; titre: string; detail: string }
interface Screenshot { src: string; caption: string; alt: string }
interface TeamMember { nom: string; moi?: true }

interface ProjectDetail {
  descriptionLongue: string
  contexte?: string
  equipe?: TeamMember[]
  stockage?: string
  technos: Techno[]
  features: Feature[]
  screenshots: Screenshot[]
}

// ─── Données détail — Nippon Kempo ────────────────────────────────────────────

const mDetailNipponKempo: ProjectDetail = {
  descriptionLongue:
    'Application de bureau hors-ligne pour gérer intégralement des tournois de Nippon Kempo. ' +
    'Félicitée par le jury CESI et utilisée en production par la vraie association sportive.',
  contexte:
    'Le Nippon Kempo est un art martial japonais mêlant frappes, projections et immobilisations, ' +
    'pratiqué sous forme de combats réglementés avec des protections spécifiques.',
  equipe: [
    { nom: 'GUERRIN Florian', moi: true },
    { nom: 'ROELLY Marius' },
    { nom: 'SPREDER Pierre' },
    { nom: 'BURST Christophe' },
  ],
  stockage:
    'IndexedDB + Replicache — toutes les données sont stockées localement. ' +
    'Zéro serveur, zéro connexion requise.',
  technos: [
    { label: 'Vue 3',          detail: 'Composition API',    color: '#4ade80' },
    { label: 'Electron',       detail: 'App de bureau',       color: '#60a5fa' },
    { label: 'Vuestic UI',     detail: 'Framework UI',        color: '#a78bfa' },
    { label: 'IndexedDB',      detail: 'Stockage local',      color: '#fbbf24' },
    { label: 'Replicache',     detail: 'Sync hors-ligne',     color: '#fb923c' },
    { label: 'ApexCharts',     detail: 'Graphiques & stats',  color: '#f472b6' },
    { label: 'Material Icons', detail: 'Icônes',              color: '#94a3b8' },
    { label: 'GitHub',         detail: 'Versionning',         color: '#e2e8f0' },
  ],
  features: [
    { icon: '🔐', titre: 'Authentification',          detail: 'Accès sécurisé par mot de passe.' },
    { icon: '🏆', titre: 'Gestion des tournois',      detail: 'Création, édition et gestion de plusieurs tournois.' },
    { icon: '📂', titre: 'Catégories avancées',       detail: 'Poules ou tableaux éliminatoires au choix.' },
    { icon: '👥', titre: 'Participants',               detail: 'Création manuelle, liaison aux catégories.' },
    { icon: '📥', titre: 'Import / Export CSV',       detail: 'Import et export rapide des participants.' },
    { icon: '⚔️',  titre: 'Organisation des matchs',  detail: 'Scores, fautes, chrono réglementaire et additionnel.' },
    { icon: '📺', titre: 'Scoreboard projetable',     detail: 'Affichage temps réel sur écran secondaire.' },
    { icon: '📊', titre: 'Statistiques',              detail: 'Performances par participant et par catégorie.' },
    { icon: '🔧', titre: 'Génération automatique',    detail: 'Structure du tournoi selon le type de catégorie.' },
    { icon: '📄', titre: 'Export PDF',                detail: 'Résultats, classements et structure en PDF.' },
  ],
  screenshots: [
    { src: '/images/projets/nippon-kempo/tournament-create.png',     caption: 'Création d\'un tournoi',               alt: 'Écran de création de tournoi' },
    { src: '/images/projets/nippon-kempo/categorie-create.png',      caption: 'Gestion des catégories',               alt: 'Création et configuration des catégories' },
    { src: '/images/projets/nippon-kempo/import-export-players.png', caption: 'Import / Export des participants CSV', alt: 'Interface import export participants' },
    { src: '/images/projets/nippon-kempo/bracket-view.png',          caption: 'Tableau éliminatoire (brackets)',      alt: 'Vue tableau éliminatoire' },
    { src: '/images/projets/nippon-kempo/poule-view.png',            caption: 'Vue des poules',                       alt: 'Organisation et suivi des poules' },
    { src: '/images/projets/nippon-kempo/fight-result.png',          caption: 'Saisie des résultats de combat',       alt: 'Interface de saisie des scores' },
    { src: '/images/projets/nippon-kempo/scoreboard-admin.png',      caption: 'Scoreboard en temps réel',             alt: 'Scoreboard projetable' },
    { src: '/images/projets/nippon-kempo/export-pdf-poule.png',      caption: 'Export PDF des résultats',             alt: 'Export PDF résultats de poule' },
    { src: '/images/projets/nippon-kempo/classement.png',            caption: 'Classement général',                   alt: 'Vue classement général' },
    { src: '/images/projets/nippon-kempo/stats-tournament.png',      caption: 'Statistiques du tournoi',              alt: 'Graphiques et statistiques tournoi' },
  ],
}

// ─── Données détail — Tower Defense ───────────────────────────────────────────

const mDetailTowerDefense: ProjectDetail = {
  descriptionLongue:
    'Jeu web Tower Defense multijoueur développé par passion, pour jouer avec des amis. ' +
    'Développé sur le temps libre, non mis en production.',
  technos: [
    { label: 'Vue 3',        detail: 'Composition API',    color: '#4ade80' },
    { label: 'Phaser.js',    detail: 'Moteur de jeu 2D',   color: '#60a5fa' },
    { label: 'Node.js',      detail: 'Serveur backend',    color: '#fbbf24' },
    { label: 'PostgreSQL',   detail: 'Base de données',    color: '#38bdf8' },
    { label: 'GitHub',       detail: 'Versionning',        color: '#e2e8f0' },
  ],
  features: [
    { icon: '🔐', titre: 'Authentification',         detail: 'Connexion sécurisée pour accéder au jeu.' },
    { icon: '🗺️', titre: 'Plus de 8 maps',           detail: 'Plus de 8 maps distinctes avec des designs différents.' },
    { icon: '🗼', titre: 'Placement de tours',        detail: 'Pose stratégique de tours défensives.' },
    { icon: '⚡', titre: 'Améliorations de héros',    detail: 'Système d\'upgrade du héros au fil des niveaux.' },
    { icon: '🌊', titre: 'Vagues d\'ennemis',         detail: 'Ennemis progressifs avec difficulté croissante.' },
    { icon: '🏆', titre: 'Écran de victoire',         detail: 'Résumé et score en fin de partie.' },
  ],
  screenshots: [
    { src: '/images/projets/towerdefense/auth.png',         caption: 'Authentification',           alt: 'Écran de connexion' },
    { src: '/images/projets/towerdefense/main-screen.png',  caption: 'Écran principal',            alt: 'Menu principal du jeu' },
    { src: '/images/projets/towerdefense/levels.png',       caption: 'Sélection des niveaux',      alt: 'Choix du niveau' },
    { src: '/images/projets/towerdefense/map-1-game.png',   caption: 'Map 1 - en jeu',             alt: 'Gameplay sur la map 1' },
    { src: '/images/projets/towerdefense/map-2.png',        caption: 'Map 2',                      alt: 'Aperçu de la map 2' },
    { src: '/images/projets/towerdefense/map-3.png',        caption: 'Map 3',                      alt: 'Aperçu de la map 3' },
    { src: '/images/projets/towerdefense/hero-upgrade.png', caption: 'Améliorations du héros',     alt: 'Interface d\'amélioration du héros' },
    { src: '/images/projets/towerdefense/success.png',      caption: 'Écran de victoire',          alt: 'Écran de succès en fin de partie' },
  ],
}

// ─── Données détail — NegoSud ─────────────────────────────────────────────────

const mDetailNegoSud: ProjectDetail = {
  descriptionLongue:
    'Application de bureau complète pour la gestion d\'un stock de vins. ' +
    'Projet de fin de Bac+2 réalisé en équipe : gestion des vins, familles, fournisseurs, commandes, inventaires et tableau de bord.',
  contexte:
    'NegoSud est une application desktop orientée négoce viticole. ' +
    'Elle couvre l\'ensemble du cycle de vie du stock : création des produits, gestion des fournisseurs, réalisation des inventaires et suivi des commandes.',
  equipe: [
    { nom: 'GUERRIN Florian', moi: true },
  ],
  stockage: 'Base de données relationnelle locale via Axios + API REST interne. Données persistantes sur le poste de travail.',
  technos: [
    { label: 'Quasar 2',       detail: 'Framework Vue 3',     color: '#00b4ff' },
    { label: 'Vue 3',          detail: 'Composition API',     color: '#4ade80' },
    { label: 'Electron',       detail: 'App de bureau',       color: '#60a5fa' },
    { label: 'Axios',          detail: 'Requêtes HTTP',       color: '#fbbf24' },
    { label: 'ApexCharts',     detail: 'Graphiques & stats',  color: '#f472b6' },
    { label: 'Vue Router',     detail: 'Navigation SPA',      color: '#a78bfa' },
    { label: 'Lordicon',       detail: 'Icônes animées',      color: '#fb923c' },
    { label: 'GitHub',         detail: 'Versionning',         color: '#e2e8f0' },
  ],
  features: [
    { icon: '🍷', titre: 'Gestion des vins',         detail: 'Création, édition et suppression de vins avec photos et familles.' },
    { icon: '📦', titre: 'Gestion des stocks',        detail: 'Suivi quantitatif en temps réel par produit et emplacement.' },
    { icon: '🏭', titre: 'Gestion des fournisseurs',  detail: 'Création et gestion complète des fournisseurs.' },
    { icon: '📋', titre: 'Commandes fournisseurs',    detail: 'Création, suivi et réception des commandes.' },
    { icon: '📊', titre: 'Inventaires',               detail: 'Réalisation d\'inventaires avec écarts calculés automatiquement.' },
    { icon: '🏷️', titre: 'Familles de vins',          detail: 'Classification par famille, type, appellation et millésime.' },
    { icon: '📈', titre: 'Dashboard',                 detail: 'Tableau de bord avec graphiques ApexCharts : stocks, mouvements, alertes.' },
    { icon: '🖼️', titre: 'Gestion des images',        detail: 'Ajout et visualisation de photos pour chaque produit.' },
  ],
  screenshots: [],
}

// ─── Données détail — Bricoloc ────────────────────────────────────────────────

const mDetailBricoloc: ProjectDetail = {
  descriptionLongue:
    'Projet collaboratif d\'architecture logicielle : modernisation complète du système d\'information ' +
    'd\'une entreprise fictive de location d\'outils en ligne. Présentation orale de 20 minutes devant jury + rapport individuel d\'une dizaine de pages.',
  contexte:
    'BricoLoc est une plateforme de location d\'outils existant depuis 2013, dont le SI avait dégénéré en "grande boule de boue" : ' +
    'monolithe Java EE 6, base Oracle 11g surdimensionnée, synchronisation de stocks par batchs CSV nocturnes, ' +
    'services WCF VB.NET dont le code source avait été perdu, et une VM Red Hat VirtualBox non identifiée toujours active sur le réseau. ' +
    'L\'objectif : concevoir une nouvelle architecture cloud-native pour remplacer l\'ensemble.',
  equipe: [
    { nom: 'GUERRIN Florian', moi: true },
    { nom: 'Victor' },
    { nom: 'Sullivan' },
    { nom: 'Mikail' },
  ],
  technos: [
    { label: 'AWS',           detail: 'Cloud provider cible',         color: '#f59e0b' },
    { label: 'Spring Boot 3', detail: 'Microservices backend',        color: '#6ade80' },
    { label: 'Next.js 14',    detail: 'Frontend React',               color: '#e2e8f0' },
    { label: 'PostgreSQL',    detail: 'SGBDR retenu (vs Oracle)',      color: '#38bdf8' },
    { label: 'Kafka MSK',     detail: 'Bus de messages événementiel', color: '#fb923c' },
    { label: 'Docker',        detail: 'Conteneurisation',             color: '#60a5fa' },
  ],
  features: [
    { icon: '🔍', titre: 'Diagnostic du SI existant',      detail: 'Identification et analyse des points faibles : dette technique, coûts, risques opérationnels.' },
    { icon: '📋', titre: '10 exigences non fonctionnelles', detail: 'Définition des ENF : performance, scalabilité, sécurité, disponibilité, maintenabilité...' },
    { icon: '🧩', titre: '8 microservices identifiés',     detail: 'Décomposition logique du domaine métier en microservices indépendants et déployables.' },
    { icon: '⚖️', titre: '6 matrices de choix pondérées',  detail: 'Justification des décisions technologiques : cloud, SGBDR, bus de messages, frontend.' },
    { icon: '🔄', titre: 'Migration Strangler Fig',        detail: 'Plan de migration progressif en 5 phases sur 15 mois pour éviter le big bang.' },
    { icon: '📝', titre: 'Rapport individuel',             detail: 'Rapport de ~10 pages couvrant le diagnostic, les ENF, le style architectural et les matrices de décision.' },
  ],
  screenshots: [],
}

// ─── Map id → détail ──────────────────────────────────────────────────────────

const mDetailsMap: Record<string, ProjectDetail> = {
  'nippon-kempo': mDetailNipponKempo,
  'tower-defense': mDetailTowerDefense,
  'negosud': mDetailNegoSud,
  'bricoloc': mDetailBricoloc,
}

const mDetailCourant = computed<ProjectDetail | null>(() =>
  mDetailId.value ? (mDetailsMap[mDetailId.value] ?? null) : null
)

// ─── Projets réels ────────────────────────────────────────────────────────────

const mProjets: Project[] = [
  // ── École ──────────────────────────────────────────────────────────────────
  {
    id: 'bricoloc',
    titre: 'BricoLoc - Refonte SI',
    type: 'Architecture SI - Bac+5 CESI',
    categorie: 'ecole',
    status: 'archived',
    description:
      'Modernisation complète du SI d\'une plateforme de location d\'outils fictive. Diagnostic du monolithe existant, décomposition en 8 microservices, plan de migration Strangler Fig, matrices de choix technologiques.',
    tags: ['AWS', 'Spring Boot 3', 'Next.js 14', 'PostgreSQL', 'Kafka'],
    detail: 'bricoloc',
  },
  {
    id: 'nippon-kempo',
    titre: 'Application Nippon Kempo',
    type: 'Projet CESI Bac+3',
    categorie: 'ecole',
    status: 'live',
    description:
      'Application de bureau hors-ligne complète pour la gestion de tournois de Nippon Kempo. Félicitée par le jury CESI, utilisée en production par la vraie association sportive.',
    tags: ['Vue 3', 'Electron', 'IndexedDB', 'ApexCharts', 'Vuestic UI'],
    detail: 'nippon-kempo',
  },
  {
    id: 'negosud',
    titre: 'NegoSud',
    type: 'Projet CESI Bac+2',
    categorie: 'ecole',
    status: 'archived',
    description:
      'Application de bureau de gestion complète d\'un stock de vins. Familles, fournisseurs, commandes, inventaires, dashboard avec graphiques. Projet de fin de Bac+2.',
    tags: ['Quasar 2', 'Vue 3', 'Electron', 'Axios', 'ApexCharts'],
    detail: 'negosud',
  },
  // ── Perso ──────────────────────────────────────────────────────────────────
  {
    id: 'vps',
    titre: 'Infrastructure VPS OVH',
    type: 'Projet personnel',
    categorie: 'perso',
    status: 'live',
    description:
      'VPS OVH entièrement dockerisé, accès VPN WireGuard. En production pour usage personnel : intranet famille, stockage photos, gestionnaire de mots de passe OTP, Supabase self-hosted, monitoring Prometheus + Grafana.',
    tags: ['Docker', 'WireGuard', 'Nginx', 'Supabase', 'Prometheus', 'Grafana'],
  },
  {
    id: 'portfolio',
    titre: 'florian-guerrin.fr',
    type: 'Portfolio',
    categorie: 'perso',
    status: 'live',
    description:
      'Ce portfolio. Arbre génératif, météo Open-Meteo temps réel, Canvas API, ciel jour/nuit/saisons, 7 modales GSAP. Nuxt 3 + TypeScript strict.',
    tags: ['Nuxt 3', 'Vue 3', 'TypeScript', 'Canvas API', 'GSAP', 'Open-Meteo'],
    url: 'https://florian-guerrin.fr',
  },
  {
    id: 'messagerie',
    titre: 'Messagerie chiffrée E2E',
    type: 'Projet personnel',
    categorie: 'perso',
    status: 'archived',
    description:
      'Projet de test personnel (2023) pour comprendre et implémenter le chiffrement bout en bout : échanges de clés, chiffrement des messages, WebSocket temps réel. But : apprendre, pas mise en production.',
    tags: ['Node.js', 'WebSocket', 'Cryptographie', 'Vue 3'],
  },
  {
    id: 'tower-defense',
    titre: 'Tower Defense Web',
    type: 'Projet personnel',
    categorie: 'perso',
    status: 'archived',
    description:
      'Jeu web Tower Defense développé en Vue 3 avec Phaser.js. Créé pour m\'amuser et jouer avec mes amis, non mis en production.',
    tags: ['Vue 3', 'Phaser.js', 'PostgreSQL', 'Node.js'],
    detail: 'tower-defense',
  },
]

// ─── Groupes par catégorie ────────────────────────────────────────────────────

interface ProjetGroupe {
  label: string
  icon: string
  accentClass: string
  projets: Project[]
}

const mGroupes = computed<ProjetGroupe[]>(() => [
  {
    label: 'Projets d\'école',
    icon: '🎓',
    accentClass: 'groupe--ecole',
    projets: mProjets.filter(lP => lP.categorie === 'ecole'),
  },
  {
    label: 'Projets personnels',
    icon: '🖥️',
    accentClass: 'groupe--perso',
    projets: mProjets.filter(lP => lP.categorie === 'perso'),
  },
])

// ─── Helpers statut ───────────────────────────────────────────────────────────

interface StatusConfig {
  label: string
  variant: 'amber' | 'blue' | 'green' | 'default'
}

const mStatusConfig: Record<ProjectStatus, StatusConfig> = {
  dev:      { label: 'En développement', variant: 'amber' },
  ongoing:  { label: 'En cours',         variant: 'blue' },
  live:     { label: 'Live / Production', variant: 'green' },
  archived: { label: 'Archivé',          variant: 'default' },
}
</script>

<template>
  <ModalBase v-model="mOuverte" :title="mTitreModal" @keydown="mOnKeydown">

    <!-- ── VUE LISTE ──────────────────────────────────────────────────────────── -->
    <Transition name="slide" mode="out-in">
      <div v-if="!mDetailId" key="liste" class="projets-liste">

        <template v-for="lGroupe in mGroupes" :key="lGroupe.label">
          <div class="projets-groupe" :class="lGroupe.accentClass">

            <!-- En-tête de section -->
            <div class="groupe-header">
              <span class="groupe-icon">{{ lGroupe.icon }}</span>
              <h3 class="groupe-label">{{ lGroupe.label }}</h3>
              <span class="groupe-count">{{ lGroupe.projets.length }}</span>
            </div>

            <!-- Grille de cartes -->
            <div class="projets-grid">
              <article
                v-for="lProjet in lGroupe.projets"
                :key="lProjet.id"
                v-tilt
                class="project-card"
              >
                <!-- En-tête carte -->
                <div class="flex items-start justify-between gap-3 mb-2.5">
                  <div class="flex-1">
                    <div class="mb-0.5">
                      <span class="project-type">{{ lProjet.type }}</span>
                    </div>
                    <h3 class="font-bold text-base leading-tight" style="color: var(--modal-text)">
                      {{ lProjet.titre }}
                    </h3>
                  </div>
                  <Tag
                    :label="mStatusConfig[lProjet.status].label"
                    :variant="mStatusConfig[lProjet.status].variant"
                  />
                </div>

                <!-- Description -->
                <p class="text-sm opacity-75 mb-3 leading-relaxed" style="color: var(--modal-text)">
                  {{ lProjet.description }}
                </p>

                <!-- Tags -->
                <div class="flex flex-wrap gap-1.5">
                  <Tag v-for="lTag in lProjet.tags" :key="lTag" :label="lTag" small />
                </div>

                <!-- Bouton détail -->
                <button
                  v-if="lProjet.detail"
                  class="project-link project-link--detail"
                  @click="mOuvrirDetail(lProjet.id)"
                  :aria-label="`Découvrir ${lProjet.titre}`"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="5" cy="5" r="3.5"/>
                    <path d="M8 8l2.5 2.5"/>
                  </svg>
                  Découvrir le projet
                </button>

                <!-- Lien externe -->
                <a
                  v-else-if="lProjet.url"
                  :href="lProjet.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="project-link"
                  :aria-label="`Voir ${lProjet.titre}`"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                    <path d="M7 1h4v4M11 1L5 7M3 2H1v9h9V9" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Voir le projet
                </a>
              </article>
            </div>
          </div>
        </template>

      </div>

      <!-- ── VUE DÉTAIL ────────────────────────────────────────────────────────── -->
      <div v-else-if="mDetailCourant" key="detail" class="detail-view">

        <!-- Retour -->
        <button class="detail-back" @click="mRetourListe">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M9 11L4 7l5-4"/>
          </svg>
          Tous les projets
        </button>

        <!-- Badges -->
        <div class="detail-badges">
          <span v-if="mDetailId === 'nippon-kempo'" class="detail-badge detail-badge--gold">⭐ Félicitée par le jury CESI</span>
          <span v-if="mDetailId === 'nippon-kempo'" class="detail-badge detail-badge--green">✅ En production</span>
          <span v-if="mDetailId === 'negosud'"      class="detail-badge detail-badge--gold">🎓 Projet Bac+2 CESI</span>
          <span v-if="mDetailId === 'bricoloc'"     class="detail-badge detail-badge--gold">🎓 Projet Bac+5 CESI</span>
        </div>

        <!-- Description longue -->
        <p class="detail-desc">{{ mDetailCourant.descriptionLongue }}</p>
        <p v-if="mDetailCourant.contexte" class="detail-contexte">{{ mDetailCourant.contexte }}</p>

        <!-- Équipe + Stockage -->
        <div v-if="mDetailCourant.equipe || mDetailCourant.stockage" class="detail-grid-2">
          <div v-if="mDetailCourant.equipe" class="detail-card">
            <h4 class="detail-card__title">👥 Équipe</h4>
            <ul class="detail-team">
              <li v-for="lM in mDetailCourant.equipe" :key="lM.nom" class="detail-team__item">
                <span class="detail-team__dot" />
                {{ lM.nom }}
                <span v-if="lM.moi" class="detail-team__me">moi</span>
              </li>
            </ul>
          </div>
          <div v-if="mDetailCourant.stockage" class="detail-card">
            <h4 class="detail-card__title">🗄️ Stockage</h4>
            <p class="detail-card__text">{{ mDetailCourant.stockage }}</p>
          </div>
        </div>

        <!-- Technologies -->
        <div class="detail-section">
          <h4 class="detail-section__title">Technologies</h4>
          <div class="detail-tech-grid">
            <div
              v-for="lT in mDetailCourant.technos"
              :key="lT.label"
              class="detail-tech-item"
              :style="{ '--tc': lT.color }"
            >
              <span class="detail-tech-dot" />
              <div>
                <div class="detail-tech-label">{{ lT.label }}</div>
                <div class="detail-tech-sub">{{ lT.detail }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Fonctionnalités -->
        <div class="detail-section">
          <h4 class="detail-section__title">Fonctionnalités</h4>
          <div class="detail-feat-grid">
            <div v-for="lF in mDetailCourant.features" :key="lF.titre" class="detail-feat-item">
              <span class="detail-feat-icon">{{ lF.icon }}</span>
              <div>
                <div class="detail-feat-title">{{ lF.titre }}</div>
                <div class="detail-feat-sub">{{ lF.detail }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Galerie -->
        <div v-if="mDetailCourant.screenshots.length > 0" class="detail-section">
          <h4 class="detail-section__title">Captures d'écran</h4>
          <div class="detail-gallery">
            <button
              v-for="(lS, lIdx) in mDetailCourant.screenshots"
              :key="lS.src"
              class="detail-gallery__item"
              @click="mOuvrirLightbox(lIdx)"
              :aria-label="`Agrandir : ${lS.caption}`"
            >
              <img :src="lS.src" :alt="lS.alt" class="detail-gallery__img" loading="lazy" />
              <div class="detail-gallery__caption">{{ lS.caption }}</div>
              <div class="detail-gallery__overlay">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

      </div>
    </Transition>

    <!-- ── LIGHTBOX (teleport body) ──────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="lb">
        <div
          v-if="mLightboxIndex !== null && mDetailCourant"
          class="lb-overlay"
          @click.self="mFermerLightbox"
          role="dialog"
          aria-modal="true"
        >
          <button class="lb-close" @click="mFermerLightbox" aria-label="Fermer">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <path d="M14 4L4 14M4 4l10 10"/>
            </svg>
          </button>

          <button class="lb-nav lb-nav--prev" @click="mLightboxPrev" aria-label="Précédent">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 14L5 9l6-5"/>
            </svg>
          </button>

          <div class="lb-content">
            <img
              :src="mDetailCourant.screenshots[mLightboxIndex].src"
              :alt="mDetailCourant.screenshots[mLightboxIndex].alt"
              class="lb-img"
            />
            <p class="lb-caption">
              {{ mDetailCourant.screenshots[mLightboxIndex].caption }}
              <span class="lb-counter">{{ mLightboxIndex + 1 }} / {{ mDetailCourant.screenshots.length }}</span>
            </p>
          </div>

          <button class="lb-nav lb-nav--next" @click="mLightboxNext" aria-label="Suivant">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M7 4l6 5-6 5"/>
            </svg>
          </button>
        </div>
      </Transition>
    </Teleport>

  </ModalBase>
</template>

<style scoped>
/* ── Liste projets ─────────────────────────────────────────────────────────── */

.projets-liste {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* ── Groupe (École / Perso) ────────────────────────────────────────────────── */

.projets-groupe {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.groupe-header {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid var(--modal-header-border);
}

.groupe-icon {
  font-size: 1rem;
  line-height: 1;
}

.groupe-label {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--modal-text);
  opacity: 0.55;
}

.groupe-count {
  margin-left: auto;
  font-size: 0.68rem;
  font-weight: 600;
  padding: 0.15rem 0.55rem;
  border-radius: 99px;
  background: rgba(0, 0, 0, 0.06);
  color: var(--modal-text);
  opacity: 0.5;
}

.dark .groupe-count {
  background: rgba(255, 255, 255, 0.08);
}

/* Accent couleur gauche selon catégorie */
.groupe--ecole .groupe-label   { color: #a78bfa; opacity: 0.85; }
.groupe--ecole .groupe-header  { border-color: rgba(167, 139, 250, 0.2); }
.groupe--perso .groupe-label   { color: #22d3ee; opacity: 0.85; }
.groupe--perso .groupe-header  { border-color: rgba(34, 211, 238, 0.2); }

.projets-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

@media (max-width: 520px) {
  .projets-grid { grid-template-columns: 1fr; }
}

.project-type {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 600;
  opacity: 0.4;
  color: var(--modal-text);
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: #3b82f6;
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.15s;
}
.project-link:hover { opacity: 1; text-decoration: underline; }

.project-link--detail {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #a78bfa;
  font-family: inherit;
}
.project-link--detail:hover { opacity: 1; text-decoration: underline; }

/* ── Transition liste ↔ détail ─────────────────────────────────────────────── */

.slide-enter-active,
.slide-leave-active {
  transition: opacity 0.2s ease, transform 0.22s ease;
}
.slide-enter-from  { opacity: 0; transform: translateX(18px); }
.slide-leave-to    { opacity: 0; transform: translateX(-18px); }

/* ── Vue détail ────────────────────────────────────────────────────────────── */

.detail-view {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Retour */
.detail-back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--modal-text);
  opacity: 0.45;
  padding: 0;
  font-family: inherit;
  transition: opacity 0.15s;
}
.detail-back:hover { opacity: 0.85; }

/* Badges */
.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.detail-badge {
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.2rem 0.65rem;
  border-radius: 99px;
}
.detail-badge--gold  { background: rgba(251,191,36,.1);  border: 1px solid rgba(251,191,36,.25); color: #fbbf24; }
.detail-badge--green { background: rgba(74,222,128,.09); border: 1px solid rgba(74,222,128,.2);  color: #4ade80; }

/* Textes */
.detail-desc {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--modal-text);
  opacity: 0.8;
}
.detail-contexte {
  font-size: 0.85rem;
  line-height: 1.65;
  color: var(--modal-text);
  opacity: 0.55;
  font-style: italic;
}

/* Grille 2 cols */
.detail-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}
@media (max-width: 500px) { .detail-grid-2 { grid-template-columns: 1fr; } }

/* Cards équipe/stockage */
.detail-card {
  background: rgba(128,128,128,.07);
  border: 1px solid rgba(128,128,128,.12);
  border-radius: 10px;
  padding: 1rem 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}
.detail-card__title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--modal-text);
  opacity: 0.45;
}
.detail-card__text {
  font-size: 0.85rem;
  line-height: 1.65;
  color: var(--modal-text);
  opacity: 0.7;
}

/* Équipe */
.detail-team { list-style: none; display: flex; flex-direction: column; gap: 0.45rem; }
.detail-team__item {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--modal-text);
  opacity: 0.8;
}
.detail-team__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: #a78bfa;
  flex-shrink: 0;
}
.detail-team__me {
  font-size: 0.65rem;
  font-weight: 700;
  color: #a78bfa;
  background: rgba(167,139,250,.12);
  border: 1px solid rgba(167,139,250,.2);
  padding: 0.08rem 0.4rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Section */
.detail-section { display: flex; flex-direction: column; gap: 0.75rem; }
.detail-section__title {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--modal-text);
  opacity: 0.4;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(128,128,128,.1);
}

/* Technos */
.detail-tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.5rem;
}
.detail-tech-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(128,128,128,.05);
  border: 1px solid rgba(128,128,128,.1);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
}
.detail-tech-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--tc, #94a3b8);
  flex-shrink: 0;
}
.detail-tech-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--modal-text);
  opacity: 0.85;
}
.detail-tech-sub {
  font-size: 0.7rem;
  color: var(--modal-text);
  opacity: 0.4;
}

/* Fonctionnalités */
.detail-feat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.5rem;
}
.detail-feat-item {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  background: rgba(128,128,128,.04);
  border: 1px solid rgba(128,128,128,.08);
  border-radius: 8px;
  padding: 0.7rem 0.85rem;
}
.detail-feat-icon { font-size: 1.1rem; flex-shrink: 0; line-height: 1; margin-top: 0.05rem; }
.detail-feat-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--modal-text);
  opacity: 0.85;
  margin-bottom: 0.2rem;
}
.detail-feat-sub {
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--modal-text);
  opacity: 0.5;
}

/* Galerie */
.detail-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.75rem;
}
.detail-gallery__item {
  position: relative;
  background: none;
  border: 1px solid rgba(128,128,128,.12);
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;
  display: flex;
  flex-direction: column;
  transition: border-color 0.18s, transform 0.18s;
}
.detail-gallery__item:hover {
  border-color: rgba(167,139,250,.45);
  transform: translateY(-2px);
}
.detail-gallery__item:hover .detail-gallery__overlay { opacity: 1; }
.detail-gallery__img {
  width: 100%;
  aspect-ratio: 16/10;
  object-fit: cover;
  display: block;
  background: rgba(128,128,128,.08);
}
.detail-gallery__caption {
  font-size: 0.74rem;
  color: var(--modal-text);
  opacity: 0.5;
  padding: 0.45rem 0.7rem;
  text-align: left;
}
.detail-gallery__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,.45);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.18s;
}

/* ── Lightbox ──────────────────────────────────────────────────────────────── */

.lb-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0,0,0,.92);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
}
.lb-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.85rem;
  max-width: min(88vw, 1100px);
}
.lb-img {
  max-height: 78vh;
  max-width: 100%;
  object-fit: contain;
  border-radius: 7px;
  box-shadow: 0 0 50px rgba(0,0,0,.5);
}
.lb-caption {
  font-size: 0.82rem;
  color: rgba(255,255,255,.5);
  display: flex;
  align-items: center;
  gap: 0.65rem;
}
.lb-counter { font-size: 0.75rem; color: rgba(255,255,255,.3); font-variant-numeric: tabular-nums; }
.lb-close {
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(255,255,255,.1);
  border: 1px solid rgba(255,255,255,.14);
  border-radius: 50%;
  width: 38px; height: 38px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s;
}
.lb-close:hover { background: rgba(255,255,255,.18); }
.lb-nav {
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.12);
  border-radius: 50%;
  width: 42px; height: 42px;
  display: flex; align-items: center; justify-content: center;
  color: #fff;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.lb-nav:hover { background: rgba(255,255,255,.16); }

/* Transition lightbox */
.lb-enter-active, .lb-leave-active { transition: opacity 0.18s; }
.lb-enter-from, .lb-leave-to { opacity: 0; }
</style>
