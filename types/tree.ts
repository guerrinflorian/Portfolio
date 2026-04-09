// Auteur : GUERRINF - Florian Guerrin
// Types pour le système d'arbre (structure récursive bezier)

import type { Season } from './weather'

// ─── Identifiant des noeuds UI ────────────────────────────────────────────────

export type TreeNodeId =
  | 'profil'
  | 'experience'
  | 'diplomes'
  | 'stack'
  | 'projets'
  | 'passions'
  | 'contact'

// ─── Configuration d'un noeud interactif ─────────────────────────────────────

export interface TreeNodeConfig {
  id: TreeNodeId
  /** Profondeur dans l'arbre (0 = tronc) */
  depth: number
  /** Index DFS à cette profondeur (ordre de rendu) */
  depthIndex: number
  /** Position 0–1 le long de la bezier de la branche */
  t: number
  color: string
  pulsePhase: number
  label: string
  radius: number
  icon: string
}

// ─── Noeud de l'arbre (structure récursive) ───────────────────────────────────

export interface TreeNode {
  id: number
  depth: number
  /** Angle absolu au repos (world space, rad) */
  restAngle: number
  length: number
  thickness: number
  oscFreq: number
  oscPhase: number
  /** Magnitude du décalage du point de contrôle bezier */
  curvature: number
  /** Où sur la bezier parente ce noeud prend sa source (0–1) */
  parentT: number
  children: TreeNode[]
  // ── Calculé à chaque frame ─────────────────────────────────────
  sx: number; sy: number
  ex: number; ey: number
  cpx: number; cpy: number
}

// ─── Feuille volante (physique) ───────────────────────────────────────────────

export interface FlyingLeaf {
  x: number
  y: number
  vx: number
  vy: number
  angle: number
  angularVelocity: number
  width: number
  height: number
  color: string
  alpha: number
  life: number   // 0–1, décroît chaque frame
}

// ─── État de physique du vent ─────────────────────────────────────────────────

export interface WindState {
  currentSpeed: number
  targetSpeed: number
  maxAmplitude: number
  lastUpdate: number
}

// ─── Configuration saisonnière ────────────────────────────────────────────────

export interface SeasonConfig {
  season: Season
  lengthMultiplier: number
  leafColors: string[]
  budColors: string[]
  foliageDensity: number
  grassColor: string
}
