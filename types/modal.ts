// Auteur : GUERRINF - Florian Guerrin
// Types pour le système de modales

import type { TreeNodeId } from './tree'

// ─── Identifiants de modales ──────────────────────────────────────────────────

export type ModalId = TreeNodeId | 'contact' | 'minijeu'

// ─── Store modal ──────────────────────────────────────────────────────────────

export interface ModalStoreState {
  activeModal: ModalId | null
  isAnimating: boolean
}

// ─── Compétence pour la barre de progression ──────────────────────────────────

export type SkillContext = 'prod' | 'projet'

export interface Skill {
  name: string
  level: number      // 0–100
  category: SkillCategory
  context: SkillContext
}

export type SkillCategory = 'front' | 'back' | 'outils' | 'creatif'

// ─── Expérience professionnelle ───────────────────────────────────────────────

export interface Experience {
  id: string
  poste: string
  entreprise: string
  periode: {
    debut: string    // Format : "Jan 2022"
    fin: string      // "Aujourd'hui" ou date
  }
  lieu: string
  tags: string[]
  points: string[]
}

// ─── Diplôme / formation ──────────────────────────────────────────────────────

export interface Diplome {
  id: string
  titre: string
  etablissement: string
  annee: string
  description?: string
}

// ─── Projet personnel ─────────────────────────────────────────────────────────

export type ProjectStatus = 'dev' | 'ongoing' | 'live' | 'archived'
export type ProjectCategorie = 'ecole' | 'perso'

export interface Project {
  id: string
  titre: string
  type: string
  categorie: ProjectCategorie
  status: ProjectStatus
  description: string
  tags: string[]
  url?: string
  detail?: string  // slug de la page /projets/[detail]
}

// ─── Langue ───────────────────────────────────────────────────────────────────

export interface Language {
  nom: string
  niveau: string
  flag?: string
}
