<script setup lang="ts">
// Auteur : GUERRINF - Florian Guerrin
// Composant principal - arbre récursif à courbes de Bézier avec physique de vent

import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useWeatherStore } from '~/stores/weather'
import { useTreePhysics } from '~/composables/useTreePhysics'
import { useModal } from '~/composables/useModal'
import { useLocale } from '~/composables/useLocale'
import type { TreeNode, FlyingLeaf, SeasonConfig, TreeNodeConfig } from '~/types/tree'
import type { Season } from '~/types/weather'

// ─── Constantes ───────────────────────────────────────────────────────────────

const DEPTH_THICKNESS  = [34, 12, 7, 4, 2.2]   // épaisseur par profondeur
const DEPTH_CURVATURE  = [0,  0.15, 0.19, 0.22, 0.24]  // courbure bezier par profondeur
const DEPTH_LENGTH_DECAY = 0.65                // décroissance longueur par niveau
const WIND_INHERIT_FACTOR = 0.52              // transmission du vent parent→enfant

// ─── Générateur pseudo-aléatoire déterministe ────────────────────────────────

class SeededRandom {
  private s: number
  constructor(pSeed: number) { this.s = pSeed }
  next(): number {
    this.s = (this.s * 1664525 + 1013904223) >>> 0
    return this.s / 4294967296
  }
}

// ─── Types locaux ─────────────────────────────────────────────────────────────

interface RootCurve {
  cpDx: number; cpDy: number     // delta du point de contrôle depuis la base
  eDx: number;  eDy: number      // delta de l'extrémité depuis la base
  width: number
}

interface GrassBlade {
  offsetX: number
  height: number
  restAngle: number
  oscFreq: number
  oscPhase: number
}

interface LeafSprite {
  nodeId: number                 // id du TreeNode terminal concerné
  dx: number; dy: number         // offset depuis l'extrémité de la branche
  w: number;  h: number
  angle: number
  colorIdx: number
  alpha: number
}

// ─── Configurations saisonnières de base ──────────────────────────────────────

const SEASON_CONFIGS: Record<Season, SeasonConfig> = {
  spring: {
    season: 'spring',
    lengthMultiplier: 0.9,
    leafColors:  ['#90EE90', '#7bc47b', '#a8e6a8', '#b8f0b8'],
    budColors:   ['#FFB7C5', '#FF9BB0', '#FFC8D4'],
    foliageDensity: 0.75,
    grassColor:  'rgba(80, 160, 60, 0.75)',
  },
  summer: {
    season: 'summer',
    lengthMultiplier: 1.0,
    leafColors:  ['#2d7a2d', '#4a9e4a', '#1a6a1a', '#3d8e3d', '#5aae5a'],
    budColors:   [],
    foliageDensity: 1.0,
    grassColor:  'rgba(50, 130, 30, 0.75)',
  },
  autumn: {
    season: 'autumn',
    lengthMultiplier: 0.88,
    leafColors:  ['#D2691E', '#FF8C00', '#DC143C', '#C0392B', '#E67E22'],
    budColors:   [],
    foliageDensity: 0.6,
    grassColor:  'rgba(140, 110, 50, 0.65)',
  },
  winter: {
    season: 'winter',
    lengthMultiplier: 0.82,
    leafColors:  [],
    budColors:   [],
    foliageDensity: 0.0,
    grassColor:  'rgba(160, 170, 170, 0.55)',
  },
}

// Densité foliaire par mois (index 0=janvier) - reflète la montée en feuilles au printemps
// et la chute progressive en automne pour Moselle
const FOLIAGE_DENSITY_PAR_MOIS = [0.0, 0.0, 0.2, 0.55, 0.88, 1.0, 1.0, 0.95, 0.82, 0.48, 0.08, 0.0]

/**
 * Retourne la config saisonnière ajustée au mois courant.
 * Surcharge foliageDensity et adapte les couleurs selon l'avancement dans la saison.
 */
function computeSeasonConfig(pSeason: Season): SeasonConfig {
  const lBase  = SEASON_CONFIGS[pSeason]
  const lMois  = new Date().getMonth()  // 0-11
  const lDensity = FOLIAGE_DENSITY_PAR_MOIS[lMois] ?? lBase.foliageDensity

  // Couleurs adaptées aux transitions inter-saison
  let lLeafColors  = lBase.leafColors
  let lBudColors   = lBase.budColors
  let lGrassColor  = lBase.grassColor

  if (pSeason === 'spring' && lMois === 2) {
    // Mars : bourgeons dominants, quelques toutes petites feuilles vert très clair
    lLeafColors = ['#d4f5b0', '#c8f0a0', '#b8ea90', '#e0fcc0']
    lBudColors  = ['#FFB7C5', '#FF9BB0', '#FFC8D4', '#ffd0e0', '#f0a0b8']
  } else if (pSeason === 'autumn' && lMois === 8) {
    // Septembre : début d'automne, vert virant au jaune/orangé
    lLeafColors = ['#a8c840', '#c8b020', '#d4882a', '#9ab828', '#c09030']
    lGrassColor  = 'rgba(120, 130, 50, 0.7)'
  } else if (pSeason === 'autumn' && lMois === 10) {
    // Novembre : fin d'automne, feuilles brunes et rares
    lLeafColors = ['#7a3510', '#5a2a08', '#8b4020', '#6b3015', '#4a1e05']
    lGrassColor  = 'rgba(100, 85, 45, 0.55)'
  }

  return { ...lBase, foliageDensity: lDensity, leafColors: lLeafColors, budColors: lBudColors, grassColor: lGrassColor }
}

// ─── Configuration des 7 noeuds UI ───────────────────────────────────────────

const UI_NODE_CONFIGS: TreeNodeConfig[] = [
  { id: 'profil',     depth: 0, depthIndex: 0, t: 0.52, color: '#3b82f6', label: 'Profil',     radius: 10, pulsePhase: 0,   icon: '👤' },
  { id: 'experience', depth: 1, depthIndex: 0, t: 0.72, color: '#10b981', label: 'Expérience', radius: 8,  pulsePhase: 0.5, icon: '💼' },
  { id: 'stack',      depth: 1, depthIndex: 1, t: 0.68, color: '#f59e0b', label: 'Stack',      radius: 8,  pulsePhase: 1.5, icon: '⚡' },
  { id: 'diplomes',   depth: 1, depthIndex: 2, t: 0.74, color: '#8b5cf6', label: 'Diplômes',   radius: 7,  pulsePhase: 1.0, icon: '🎓' },
  { id: 'projets',    depth: 1, depthIndex: 3, t: 0.76, color: '#ef4444', label: 'Projets',    radius: 7,  pulsePhase: 2.0, icon: '🚀' },
  { id: 'contact',    depth: 1, depthIndex: 4, t: 0.70, color: '#06b6d4', label: 'Contact',    radius: 7,  pulsePhase: 3.0, icon: '✉️' },
  { id: 'passions',   depth: 1, depthIndex: 5, t: 0.78, color: '#ec4899', label: 'Passions',   radius: 7,  pulsePhase: 2.5, icon: '❤️' },
]

// ─── Stores et composables ────────────────────────────────────────────────────

const weatherStore = useWeatherStore()
const physics      = useTreePhysics()
const modal        = useModal()
const { t, locale } = useLocale()

// Labels traduits des noeuds - reactive selon la langue
const mNodeLabels = computed<Record<string, string>>(() => ({
  profil:     t('Profil',     'Profile'),
  experience: t('Expérience', 'Experience'),
  stack:      t('Stack',      'Stack'),
  diplomes:   t('Diplômes',   'Degrees'),
  projets:    t('Projets',    'Projects'),
  contact:    t('Contact',    'Contact'),
  passions:   t('Passions',   'Passions'),
}))


// ─── Refs et état ─────────────────────────────────────────────────────────────

const canvasRef = ref<HTMLCanvasElement | null>(null)
let ctx: CanvasRenderingContext2D | null = null

// Données statiques de la scène (régénérées sur resize/saison)
let treeRoot: TreeNode | null = null
let baseX = 0
let baseY = 0
let roots: RootCurve[] = []
let grass: GrassBlade[] = []
let leaves: LeafSprite[] = []
let flyingLeaves: FlyingLeaf[] = []

// Cache : map id->noeud (evite rebuild a chaque frame dans drawLeafClusters)
let nodeById: Map<number, TreeNode> = new Map()
// Cache : largeurs des pills (evite measureText a chaque frame)
const pillWidthCache: Map<string, number> = new Map()
// Vider le cache quand la langue change (labels differents = largeurs differentes)
watch(locale, () => { pillWidthCache.clear() })
// Buffer reutilise pour les branches terminales (evite allocation a chaque frame)
const terminalNodesBuffer: Array<{ ex: number; ey: number }> = []

// Animation
let rafId = 0
let lastTimestamp = 0

// Croissance initiale
let growProgress  = 0       // 0 → 1
let growStartTime = -1      // timestamp du premier frame
const GROW_DURATION = 2600  // ms

// Interaction
let mouseDownNodeId: string | null = null
let hoveredNodeId: string | null = null
const labelVisible = ref(false)
const labelText    = ref('')
const labelX       = ref(0)
const labelY       = ref(0)

// Positions monde des noeuds UI (recalculées chaque frame)
interface NodePosition {
  config: TreeNodeConfig
  x: number; y: number        // point d'accroche sur la branche
  px: number; py: number      // coin haut-gauche du pill
  pw: number; ph: number      // dimensions du pill
}
let nodePositions: NodePosition[] = []

// Position de l'icône CV (haut du tronc, recalculée chaque frame)
let cvPos: { x: number; y: number } | null = null

// ─── Génération de l'arbre ────────────────────────────────────────────────────

let nodeIdCounter = 0

function makeNode(
  pDepth: number,
  pAngle: number,
  pLength: number,
  pParentT: number,
  pRng: SeededRandom
): TreeNode {
  const lThickness = DEPTH_THICKNESS[pDepth] ?? 1.5
  const lCurvature = (DEPTH_CURVATURE[pDepth] ?? 0.2) * pLength
  return {
    id:         nodeIdCounter++,
    depth:      pDepth,
    restAngle:  pAngle,
    length:     pLength,
    thickness:  lThickness,
    oscFreq:    0.65 + pRng.next() * 0.7,
    oscPhase:   pRng.next() * Math.PI * 2,
    curvature:  lCurvature,
    parentT:    pParentT,
    children:   [],
    sx: 0, sy: 0, ex: 0, ey: 0, cpx: 0, cpy: 0,
  }
}

function addChildren(pParent: TreeNode, pCfg: SeasonConfig, pDepth: number, pRng: SeededRandom): void {
  if (pDepth > 4) return

  // 2 ou 3 enfants selon la profondeur
  const lCount = pDepth <= 3 ? (pRng.next() < 0.55 ? 3 : 2) : 2

  // parentT : les enfants partent en cours de branche
  const lParentTs = lCount === 2
    ? [0.58 + pRng.next() * 0.10, 0.78 + pRng.next() * 0.12]
    : [0.52 + pRng.next() * 0.08, 0.70 + pRng.next() * 0.08, 0.86 + pRng.next() * 0.08]

  for (let lI = 0; lI < lCount; lI++) {
    const lSide      = lI % 2 === 0 ? -1 : 1
    const lDeviation = (0.28 + pRng.next() * 0.18) * lSide
    const lAngle     = pParent.restAngle + lDeviation
    const lLength    = pParent.length * DEPTH_LENGTH_DECAY * pCfg.lengthMultiplier * (0.88 + pRng.next() * 0.15)

    const lChild = makeNode(pDepth, lAngle, lLength, lParentTs[lI] ?? 0.8, pRng)
    addChildren(lChild, pCfg, pDepth + 1, pRng)
    pParent.children.push(lChild)
  }
}

function buildTree(pWidth: number, pHeight: number, pSeason: Season): void {
  nodeIdCounter = 0
  const lRng = new SeededRandom(42)   // graine fixe → forme stable
  const lCfg = computeSeasonConfig(pSeason)

  baseX = pWidth / 2
  baseY = pHeight - 62

  // Tronc : légère inclinaison organique
  const lTrunkLength = pHeight * 0.42 * lCfg.lengthMultiplier
  const lLean        = (lRng.next() - 0.5) * 0.06  // ±3.4°
  const lTrunkAngle  = -Math.PI / 2 + lLean

  treeRoot = makeNode(0, lTrunkAngle, lTrunkLength, 1.0, lRng)

  // 7 branches principales à différentes hauteurs du tronc
  const lMainParentTs   = [0.44, 0.54, 0.63, 0.71, 0.78, 0.85, 0.91]
  const lMainDeviations = [-0.60, 0.64, -0.52, 0.58, -0.66, 0.54, -0.48]

  for (let lI = 0; lI < lMainParentTs.length; lI++) {
    const lAngle  = lTrunkAngle + (lMainDeviations[lI] ?? 0.5) + (lRng.next() - 0.5) * 0.08
    const lLength = lTrunkLength * (0.44 + lRng.next() * 0.12) * lCfg.lengthMultiplier

    const lBranch = makeNode(1, lAngle, lLength, lMainParentTs[lI] ?? 0.7, lRng)
    addChildren(lBranch, lCfg, 2, lRng)
    treeRoot.children.push(lBranch)
  }

  // Racines, herbe et éléments au sol (statiques, régénérées sur resize/saison)
  generateRoots(lRng)
  generateGrass(lRng, pWidth, pHeight)
  generateLeaves(pSeason, lRng)
  generateGroundElements(lRng, pWidth, pHeight)

  // Reconstruction du cache id->noeud et invalidation du cache pills
  nodeById.clear()
  pillWidthCache.clear()
  buildNodeById(treeRoot)
}

function buildNodeById(pNode: TreeNode): void {
  nodeById.set(pNode.id, pNode)
  for (const lChild of pNode.children) buildNodeById(lChild)
}

// ─── Génération des racines ───────────────────────────────────────────────────

function generateRoots(pRng: SeededRandom): void {
  roots = [
    { cpDx:  38, cpDy: 8,  eDx:  78, eDy: 22, width: 3.5 + pRng.next() * 0.5 },
    { cpDx: -35, cpDy: 10, eDx: -72, eDy: 20, width: 3.2 + pRng.next() * 0.5 },
    { cpDx:  20, cpDy: 15, eDx:  45, eDy: 32, width: 2.8 + pRng.next() * 0.3 },
    { cpDx: -18, cpDy: 13, eDx: -42, eDy: 30, width: 2.6 + pRng.next() * 0.3 },
    { cpDx:   8, cpDy: 18, eDx:  18, eDy: 38, width: 2.0 + pRng.next() * 0.3 },
  ]
}

// ─── Génération de l'herbe ────────────────────────────────────────────────────

function generateGrass(pRng: SeededRandom, pWidth: number, pHeight: number): void {
  const lM     = 12  // marge bord
  const lScale = Math.min(1, pHeight / 900)
  const lCount = Math.max(20, Math.floor(pWidth / 24))  // densité proportionnelle à la largeur
  grass = Array.from({ length: lCount }, () => ({
    offsetX:   lM + pRng.next() * (pWidth - lM * 2),
    height:    (14 + pRng.next() * 18) * lScale,
    restAngle: -Math.PI / 2 + (pRng.next() - 0.5) * 0.32,
    oscFreq:   1.4 + pRng.next() * 1.4,
    oscPhase:  pRng.next() * Math.PI * 2,
  }))
}

// ─── Types et génération des éléments au sol ──────────────────────────────────

interface GroundRock   { x: number; rx: number; ry: number; color: string }
interface GroundFlower { x: number; height: number; petalColor: string; phase: number }
interface GroundShroom { x: number; stemH: number; capR: number; capColor: string }

let gRocks:   GroundRock[]   = []
let gFlowers: GroundFlower[] = []
let gShrooms: GroundShroom[] = []

function generateGroundElements(pRng: SeededRandom, pWidth: number, pHeight: number): void {
  const lM            = 20  // marge bord
  const lScale        = Math.min(1, pHeight / 900)  // proportionnel à la hauteur écran
  const lRockColors   = ['#8a7a68', '#7a6e60', '#968070', '#6e6255', '#b0a090']
  const lFlowerColors = ['#ff9eb5', '#ffe066', '#b8eaff', '#ffffff', '#ffb347', '#d4b0ff', '#ff6b6b', '#a8e6cf']
  const lShroomColors = ['#c0392b', '#e67e22', '#8b4513', '#a0522d', '#d35400']

  // Nombre d'éléments proportionnel à la largeur (1 tous les ~90px)
  const lRockCount   = Math.max(10, Math.floor(pWidth / 90))
  const lFlowerCount = Math.max(18, Math.floor(pWidth / 55))
  const lShroomCount = Math.max(8,  Math.floor(pWidth / 160))

  gRocks = Array.from({ length: lRockCount }, () => ({
    x:     lM + pRng.next() * (pWidth - lM * 2),
    rx:    (7 + pRng.next() * 15) * lScale,
    ry:    (4 + pRng.next() * 9)  * lScale,
    color: lRockColors[Math.floor(pRng.next() * lRockColors.length)]!,
  }))

  gFlowers = Array.from({ length: lFlowerCount }, () => ({
    x:          lM + pRng.next() * (pWidth - lM * 2),
    height:     (14 + pRng.next() * 22) * lScale,
    petalColor: lFlowerColors[Math.floor(pRng.next() * lFlowerColors.length)]!,
    phase:      pRng.next() * Math.PI * 2,
  }))

  gShrooms = Array.from({ length: lShroomCount }, () => ({
    x:        lM + pRng.next() * (pWidth - lM * 2),
    stemH:    (9 + pRng.next() * 11) * lScale,
    capR:     (6 + pRng.next() * 8)  * lScale,
    capColor: lShroomColors[Math.floor(pRng.next() * lShroomColors.length)]!,
  }))
}

function drawGroundElements(pCtx: CanvasRenderingContext2D, pTimeS: number, pWidth: number, pHeight: number): void {
  if (pWidth < 768 || pHeight < 500) return  // caché sur mobile portrait et paysage

  const lSpeed = physics.windState.value.currentSpeed

  // Rochers
  for (const lR of gRocks) {
    pCtx.save()
    const lY    = baseY + 8
    const lGrad = pCtx.createRadialGradient(lR.x - lR.rx * 0.3, lY - lR.ry * 0.3, 1, lR.x, lY, lR.rx)
    lGrad.addColorStop(0, 'rgba(255,255,255,0.18)')
    lGrad.addColorStop(1, lR.color)
    pCtx.beginPath()
    pCtx.ellipse(lR.x, lY, lR.rx, lR.ry, 0.15, 0, Math.PI * 2)
    pCtx.fillStyle = lGrad
    pCtx.fill()
    pCtx.restore()
  }

  // Fleurs
  for (const lF of gFlowers) {
    const lBaseY = baseY + 4
    const lSwing = Math.sin(pTimeS * 1.1 + lF.phase) * (lSpeed / 70) * 0.22
    const lAngle = -Math.PI / 2 + lSwing
    const lTipX  = lF.x + Math.cos(lAngle) * lF.height
    const lTipY  = lBaseY + Math.sin(lAngle) * lF.height

    pCtx.save()
    pCtx.strokeStyle = 'rgba(60,140,40,0.7)'
    pCtx.lineWidth   = 1.5
    pCtx.lineCap     = 'round'
    pCtx.beginPath()
    pCtx.moveTo(lF.x, lBaseY)
    pCtx.lineTo(lTipX, lTipY)
    pCtx.stroke()

    pCtx.beginPath()
    pCtx.arc(lTipX, lTipY, 3.5, 0, Math.PI * 2)
    pCtx.fillStyle   = lF.petalColor
    pCtx.globalAlpha = 0.88
    pCtx.fill()

    pCtx.beginPath()
    pCtx.arc(lTipX, lTipY, 1.5, 0, Math.PI * 2)
    pCtx.fillStyle   = '#f6e05e'
    pCtx.globalAlpha = 1
    pCtx.fill()
    pCtx.restore()
  }

  // Champignons
  for (const lS of gShrooms) {
    const lBaseY = baseY + 6
    const lTopY  = lBaseY - lS.stemH

    pCtx.save()
    pCtx.strokeStyle = 'rgba(230,210,180,0.85)'
    pCtx.lineWidth   = 4
    pCtx.lineCap     = 'round'
    pCtx.beginPath()
    pCtx.moveTo(lS.x, lBaseY)
    pCtx.lineTo(lS.x, lTopY)
    pCtx.stroke()

    pCtx.beginPath()
    pCtx.ellipse(lS.x, lTopY, lS.capR, lS.capR * 0.55, 0, Math.PI, 0, true)
    pCtx.fillStyle   = lS.capColor
    pCtx.globalAlpha = 0.9
    pCtx.fill()

    pCtx.fillStyle   = 'rgba(255,255,255,0.75)'
    pCtx.globalAlpha = 0.8
    pCtx.beginPath()
    pCtx.arc(lS.x - lS.capR * 0.35, lTopY - lS.capR * 0.2, 1.5, 0, Math.PI * 2)
    pCtx.fill()
    pCtx.beginPath()
    pCtx.arc(lS.x + lS.capR * 0.3, lTopY - lS.capR * 0.28, 1.2, 0, Math.PI * 2)
    pCtx.fill()
    pCtx.restore()
  }
}

// ─── Génération des feuilles ──────────────────────────────────────────────────

function collectTerminalNodes(pNode: TreeNode, pOut: TreeNode[]): void {
  if (pNode.children.length === 0) { pOut.push(pNode); return }
  for (const lChild of pNode.children) collectTerminalNodes(lChild, pOut)
}

function generateLeaves(pSeason: Season, pRng: SeededRandom): void {
  leaves = []
  if (!treeRoot) return

  const lCfg = computeSeasonConfig(pSeason)
  if (lCfg.foliageDensity === 0) return

  const lTerminals: TreeNode[] = []
  collectTerminalNodes(treeRoot, lTerminals)

  for (const lNode of lTerminals) {
    if (pRng.next() > lCfg.foliageDensity) continue

    const lCount = 8 + Math.floor(pRng.next() * 7)  // 8–14 feuilles par cluster
    for (let lI = 0; lI < lCount; lI++) {
      const lUseBud = lCfg.season === 'spring' && pRng.next() < 0.28
      const lPalette = lUseBud ? lCfg.budColors : lCfg.leafColors
      const lColorIdx = Math.floor(pRng.next() * lPalette.length)

      leaves.push({
        nodeId:   lNode.id,
        dx:       (pRng.next() - 0.5) * 42,  // ±21px
        dy:       (pRng.next() - 0.5) * 42,
        w:        13 + pRng.next() * 11,
        h:        7 + pRng.next() * 8,
        angle:    pRng.next() * Math.PI,
        colorIdx: lColorIdx,
        alpha:    0.72 + pRng.next() * 0.28,
      })
    }
  }
}

// ─── Helpers croissance ───────────────────────────────────────────────────────

function easeOutExpo(pT: number): number {
  return pT >= 1 ? 1 : 1 - Math.pow(2, -10 * pT)
}

// Retourne la fraction de dessin [0,1] pour une profondeur donnée
function getDepthFrac(pDepth: number): number {
  const lStarts = [0.00, 0.23, 0.42, 0.59, 0.74]
  const lEnds   = [0.26, 0.48, 0.66, 0.83, 0.98]
  const lS = lStarts[pDepth] ?? 0.74
  const lE = lEnds[pDepth]   ?? 0.98
  return Math.min(1, Math.max(0, (growProgress - lS) / (lE - lS)))
}

// ─── Calculs géométriques ─────────────────────────────────────────────────────

function getBezierPoint(pT: number, pSx: number, pSy: number, pCpx: number, pCpy: number, pEx: number, pEy: number): { x: number; y: number } {
  const lMt = 1 - pT
  return {
    x: lMt * lMt * pSx + 2 * lMt * pT * pCpx + pT * pT * pEx,
    y: lMt * lMt * pSy + 2 * lMt * pT * pCpy + pT * pT * pEy,
  }
}

// ─── Rendu du tronc (effilé, polygone rempli) ─────────────────────────────────

function drawTaperedTrunk(
  pCtx: CanvasRenderingContext2D,
  pSx: number, pSy: number,
  pCpx: number, pCpy: number,
  pEx: number, pEy: number,
  pFrac = 1
): void {
  const STEPS      = 18
  const lStepCount = Math.max(2, Math.round(pFrac * STEPS))

  // Calcule les points le long de la bezier (jusqu'à pFrac)
  const lPts: Array<{ x: number; y: number }> = []
  for (let lI = 0; lI <= lStepCount; lI++) {
    lPts.push(getBezierPoint(lI / STEPS, pSx, pSy, pCpx, pCpy, pEx, pEy))
  }

  const lLeft: Array<{ x: number; y: number }>  = []
  const lRight: Array<{ x: number; y: number }> = []

  for (let lI = 0; lI <= lStepCount; lI++) {
    const lT    = lI / STEPS
    const lHalf = (34 + (14 - 34) * lT) / 2  // 34 → 14 px
    const lPt   = lPts[lI]!
    const lNext = lI < lStepCount ? lPts[lI + 1]! : lPts[lI - 1]!
    const lDx   = lI < lStepCount ? lNext.x - lPt.x : lPt.x - lPts[lI - 1]!.x
    const lDy   = lI < lStepCount ? lNext.y - lPt.y : lPt.y - lPts[lI - 1]!.y
    const lLen  = Math.sqrt(lDx * lDx + lDy * lDy) || 1
    const lNx   = -lDy / lLen
    const lNy   =  lDx / lLen

    lLeft.push({ x: lPt.x + lNx * lHalf, y: lPt.y + lNy * lHalf })
    lRight.push({ x: lPt.x - lNx * lHalf, y: lPt.y - lNy * lHalf })
  }

  // Corps du tronc
  pCtx.save()
  pCtx.beginPath()
  pCtx.moveTo(lLeft[0]!.x, lLeft[0]!.y)
  for (const lP of lLeft) pCtx.lineTo(lP.x, lP.y)
  for (let lI = lRight.length - 1; lI >= 0; lI--) pCtx.lineTo(lRight[lI]!.x, lRight[lI]!.y)
  pCtx.closePath()
  pCtx.fillStyle = '#5a3e2b'
  pCtx.fill()

  // Reflet clair sur la gauche (~30% de la hauteur)
  pCtx.beginPath()
  pCtx.moveTo(lLeft[0]!.x, lLeft[0]!.y)
  const lHighlightEnd = Math.floor(lStepCount * 0.65)
  for (let lI = 1; lI <= lHighlightEnd; lI++) pCtx.lineTo(lLeft[lI]!.x, lLeft[lI]!.y)
  pCtx.strokeStyle = 'rgba(160, 118, 78, 0.38)'
  pCtx.lineWidth   = 3
  pCtx.lineCap     = 'round'
  pCtx.stroke()
  pCtx.restore()
}

// ─── Rendu récursif de l'arbre ────────────────────────────────────────────────

/**
 * Dessine un noeud et tous ses enfants en propageant le vent.
 * Le delta de vent s'accumule de la racine vers les extrémités.
 */
function renderNode(
  pCtx: CanvasRenderingContext2D,
  pNode: TreeNode,
  pParent: TreeNode | null,
  pInheritedDelta: number,
  pTimeS: number
): void {
  // ── Calcul de la position de départ ──────────────────────────────────────
  let lSx: number, lSy: number
  if (!pParent) {
    // Tronc : démarre à la base
    lSx = baseX
    lSy = baseY
  } else {
    // Branche : démarre à parentT le long de la bezier parente
    const lPt = getBezierPoint(
      pNode.parentT,
      pParent.sx, pParent.sy,
      pParent.cpx, pParent.cpy,
      pParent.ex,  pParent.ey
    )
    lSx = lPt.x
    lSy = lPt.y
  }

  // ── Oscillation du vent ───────────────────────────────────────────────────
  const lMyDelta    = physics.computeBranchWindDelta(pNode.oscFreq, pNode.oscPhase, pNode.depth, pTimeS)
  const lTotalDelta = pInheritedDelta * WIND_INHERIT_FACTOR + lMyDelta
  const lAngle      = pNode.restAngle + lTotalDelta

  const lEx = lSx + Math.cos(lAngle) * pNode.length
  const lEy = lSy + Math.sin(lAngle) * pNode.length

  // Point de contrôle : décalage perpendiculaire pour la courbure organique
  const lMx  = (lSx + lEx) / 2
  const lMy  = (lSy + lEy) / 2
  const lCpx = lMx - Math.sin(lAngle) * pNode.curvature
  const lCpy = lMy + Math.cos(lAngle) * pNode.curvature

  // Stockage pour accès ultérieur (hit test, feuilles, noeuds UI)
  pNode.sx  = lSx; pNode.sy  = lSy
  pNode.ex  = lEx; pNode.ey  = lEy
  pNode.cpx = lCpx; pNode.cpy = lCpy

  // ── Dessin (avec clipping de croissance) ────────────────────────────────
  const lFrac = getDepthFrac(pNode.depth)

  if (lFrac > 0) {
    if (pNode.depth === 0) {
      // Tronc : polygone effilé avec reflet
      drawTaperedTrunk(pCtx, lSx, lSy, lCpx, lCpy, lEx, lEy, lFrac)
    } else {
      // Branches : bezier partielle (de 0 à lFrac de la courbe)
      const lPartCpx = lSx + (lCpx - lSx) * lFrac
      const lPartCpy = lSy + (lCpy - lSy) * lFrac
      const lPartPt  = getBezierPoint(lFrac, lSx, lSy, lCpx, lCpy, lEx, lEy)

      const lT  = pNode.depth / 4
      const lR  = Math.floor(90 + lT * 49)
      const lG  = Math.floor(62 + lT * 37)
      const lB  = Math.floor(43 + lT * 21)

      pCtx.save()
      pCtx.beginPath()
      pCtx.moveTo(lSx, lSy)
      pCtx.quadraticCurveTo(lPartCpx, lPartCpy, lPartPt.x, lPartPt.y)
      pCtx.strokeStyle = `rgb(${lR}, ${lG}, ${lB})`
      pCtx.lineWidth   = pNode.thickness
      pCtx.lineCap     = 'round'
      pCtx.stroke()
      pCtx.restore()
    }
  }

  // ── Récursion ─────────────────────────────────────────────────────────────
  for (const lChild of pNode.children) {
    renderNode(pCtx, lChild, pNode, lTotalDelta, pTimeS)
  }
}

// ─── Rendu des racines ────────────────────────────────────────────────────────

function drawRoots(pCtx: CanvasRenderingContext2D): void {
  // Ombre elliptique sous le tronc
  const lGrad = pCtx.createRadialGradient(baseX, baseY + 12, 4, baseX, baseY + 12, 65)
  lGrad.addColorStop(0, 'rgba(0, 0, 0, 0.28)')
  lGrad.addColorStop(1, 'rgba(0, 0, 0, 0)')
  pCtx.save()
  pCtx.scale(1, 0.35)  // Aplatissement elliptique
  pCtx.beginPath()
  pCtx.arc(baseX, (baseY + 12) / 0.35, 65, 0, Math.PI * 2)
  pCtx.fillStyle = lGrad
  pCtx.fill()
  pCtx.restore()

  // Courbes de racines
  for (const lRoot of roots) {
    const lGradRoot = pCtx.createLinearGradient(baseX, baseY, baseX + lRoot.eDx, baseY + lRoot.eDy)
    lGradRoot.addColorStop(0, 'rgba(90, 58, 26, 0.65)')
    lGradRoot.addColorStop(1, 'rgba(90, 58, 26, 0)')

    pCtx.save()
    pCtx.beginPath()
    pCtx.moveTo(baseX, baseY)
    pCtx.quadraticCurveTo(
      baseX + lRoot.cpDx, baseY + lRoot.cpDy,
      baseX + lRoot.eDx,  baseY + lRoot.eDy
    )
    pCtx.strokeStyle = lGradRoot
    pCtx.lineWidth   = lRoot.width
    pCtx.lineCap     = 'round'
    pCtx.stroke()
    pCtx.restore()
  }
}

// ─── Rendu de l'herbe ─────────────────────────────────────────────────────────

function drawGrass(pCtx: CanvasRenderingContext2D, pTimeS: number): void {
  const lGrassColor = computeSeasonConfig(weatherStore.season).grassColor
  const lSpeed      = physics.windState.value.currentSpeed

  pCtx.save()
  pCtx.strokeStyle = lGrassColor
  pCtx.lineCap     = 'round'

  for (const lBlade of grass) {
    const lSwing = Math.sin(pTimeS * lBlade.oscFreq + lBlade.oscPhase) * (lSpeed / 60) * 0.35
    const lAngle = lBlade.restAngle + lSwing

    const lBx = lBlade.offsetX   // position absolue X
    const lBy = baseY + 6
    const lEx = lBx + Math.cos(lAngle) * lBlade.height
    const lEy = lBy + Math.sin(lAngle) * lBlade.height
    const lCpx = lBx + Math.cos(lAngle) * lBlade.height * 0.5
    const lCpy = lBy + Math.sin(lAngle) * lBlade.height * 0.5 - 4

    pCtx.lineWidth = 1.5
    pCtx.beginPath()
    pCtx.moveTo(lBx, lBy)
    pCtx.quadraticCurveTo(lCpx, lCpy, lEx, lEy)
    pCtx.stroke()
  }

  pCtx.restore()
}

// ─── Rendu des clusters de feuilles ──────────────────────────────────────────

function drawLeafClusters(pCtx: CanvasRenderingContext2D): void {
  if (!treeRoot) return

  const lCfg     = computeSeasonConfig(weatherStore.season)

  const lLeafFrac = Math.min(1, Math.max(0, (growProgress - 0.86) / 0.14))
  if (lLeafFrac <= 0) return

  pCtx.save()
  for (const lLeaf of leaves) {
    const lNode = nodeById.get(lLeaf.nodeId)
    if (!lNode) continue

    const lPalette = lCfg.season === 'spring' && lLeaf.colorIdx >= lCfg.leafColors.length
      ? lCfg.budColors
      : lCfg.leafColors
    const lColor = lPalette[lLeaf.colorIdx % lPalette.length]
    if (!lColor) continue

    const lX = lNode.ex + lLeaf.dx
    const lY = lNode.ey + lLeaf.dy

    pCtx.save()
    pCtx.translate(lX, lY)
    pCtx.rotate(lLeaf.angle)
    pCtx.globalAlpha = lLeaf.alpha * lLeafFrac
    pCtx.fillStyle   = lColor
    pCtx.beginPath()
    pCtx.ellipse(0, 0, lLeaf.w / 2, lLeaf.h / 2, 0, 0, Math.PI * 2)
    pCtx.fill()
    pCtx.restore()
  }
  pCtx.restore()
}

// ─── Rendu des feuilles volantes ──────────────────────────────────────────────

function drawFlyingLeaves(pCtx: CanvasRenderingContext2D): void {
  pCtx.save()
  for (const lLeaf of flyingLeaves) {
    pCtx.save()
    pCtx.translate(lLeaf.x, lLeaf.y)
    pCtx.rotate(lLeaf.angle)
    pCtx.globalAlpha = lLeaf.alpha
    pCtx.fillStyle   = lLeaf.color
    pCtx.beginPath()
    pCtx.ellipse(0, 0, lLeaf.width / 2, lLeaf.height / 2, 0, 0, Math.PI * 2)
    pCtx.fill()
    pCtx.restore()
  }
  pCtx.restore()
}

// ─── Rendu des noeuds UI interactifs ─────────────────────────────────────────

/**
 * Retrouve le Nième noeud à une profondeur donnée (ordre DFS).
 */
function findNodeAtDepth(pRoot: TreeNode, pDepth: number, pIndex: number): TreeNode | null {
  let lCount = 0
  function traverse(pNode: TreeNode): TreeNode | null {
    if (pNode.depth === pDepth) {
      if (lCount === pIndex) return pNode
      lCount++
    }
    for (const lChild of pNode.children) {
      const lFound = traverse(lChild)
      if (lFound) return lFound
    }
    return null
  }
  return traverse(pRoot)
}

function computeNodePositions(): void {
  if (!treeRoot) return
  nodePositions = []

  for (const lCfg of UI_NODE_CONFIGS) {
    const lNode = findNodeAtDepth(treeRoot, lCfg.depth, lCfg.depthIndex)
    if (!lNode) continue
    const lPt = getBezierPoint(lCfg.t, lNode.sx, lNode.sy, lNode.cpx, lNode.cpy, lNode.ex, lNode.ey)
    // px/py/pw/ph remplis dans drawNodes
    nodePositions.push({ config: lCfg, x: lPt.x, y: lPt.y, px: 0, py: 0, pw: 0, ph: 0 })
  }
}

// Helper: rectangle arrondi (compatibilite large)
function tracerPill(pCtx: CanvasRenderingContext2D, pX: number, pY: number, pW: number, pH: number, pR: number): void {
  pCtx.beginPath()
  pCtx.moveTo(pX + pR, pY)
  pCtx.lineTo(pX + pW - pR, pY)
  pCtx.quadraticCurveTo(pX + pW, pY, pX + pW, pY + pR)
  pCtx.lineTo(pX + pW, pY + pH - pR)
  pCtx.quadraticCurveTo(pX + pW, pY + pH, pX + pW - pR, pY + pH)
  pCtx.lineTo(pX + pR, pY + pH)
  pCtx.quadraticCurveTo(pX, pY + pH, pX, pY + pH - pR)
  pCtx.lineTo(pX, pY + pR)
  pCtx.quadraticCurveTo(pX, pY, pX + pR, pY)
  pCtx.closePath()
}

function drawNodes(pCtx: CanvasRenderingContext2D, pTimeS: number): void {
  const lNodeFrac = Math.min(1, Math.max(0, (growProgress - 0.92) / 0.08))
  if (lNodeFrac <= 0) return

  const lW        = canvasRef.value?.width  ?? 1440
  const PILL_H    = 26
  const PILL_PAD  = 9
  const LINE_LEN  = 14
  const DOT_R     = 3.5
  const ACCENT_W  = 3
  const PILL_R    = 5   // border-radius du pill

  pCtx.save()
  pCtx.font = '600 12px system-ui, -apple-system, sans-serif'

  for (const lEntry of nodePositions) {
    const lCfg     = lEntry.config
    const lHovered = hoveredNodeId === lCfg.id

    // Texte et dimensions du pill (largeur mise en cache)
    const lLabel = `${lCfg.icon}  ${mNodeLabels.value[lCfg.id] ?? lCfg.label}`
    let lTextW = pillWidthCache.get(lCfg.id)
    if (lTextW === undefined) {
      lTextW = pCtx.measureText(lLabel).width
      pillWidthCache.set(lCfg.id, lTextW)
    }
    const lPillW = lTextW + PILL_PAD * 2 + ACCENT_W

    // Direction selon la position du noeud par rapport au centre
    const lRight   = lEntry.x >= baseX - 20
    let   lPillX   = lRight ? lEntry.x + LINE_LEN : lEntry.x - LINE_LEN - lPillW
    // Clamp pour ne pas sortir du canvas
    lPillX = Math.max(6, Math.min(lW - lPillW - 6, lPillX))
    const lPillY   = lEntry.y - PILL_H / 2 - 2

    // Stockage pour hit test
    lEntry.px = lPillX
    lEntry.py = lPillY
    lEntry.pw = lPillW
    lEntry.ph = PILL_H

    const lAlpha = lNodeFrac * (lHovered ? 1 : 0.9)

    // Ligne de connexion
    pCtx.save()
    pCtx.globalAlpha = lNodeFrac * 0.55
    pCtx.strokeStyle = lCfg.color
    pCtx.lineWidth   = 1.2
    pCtx.setLineDash([3, 3])
    pCtx.beginPath()
    pCtx.moveTo(lEntry.x, lEntry.y)
    pCtx.lineTo(lRight ? lPillX : lPillX + lPillW, lEntry.y)
    pCtx.stroke()
    pCtx.setLineDash([])
    pCtx.restore()

    // Point d'accroche
    pCtx.save()
    pCtx.globalAlpha = lNodeFrac
    pCtx.beginPath()
    pCtx.arc(lEntry.x, lEntry.y, DOT_R, 0, Math.PI * 2)
    pCtx.fillStyle   = lCfg.color
    pCtx.fill()
    pCtx.strokeStyle = 'rgba(255,255,255,0.75)'
    pCtx.lineWidth   = 1.5
    pCtx.stroke()
    pCtx.restore()

    // Fond du pill
    pCtx.save()
    pCtx.globalAlpha = lAlpha
    tracerPill(pCtx, lPillX, lPillY, lPillW, PILL_H, PILL_R)
    pCtx.fillStyle = lHovered ? 'rgba(18, 30, 55, 0.96)' : 'rgba(10, 18, 38, 0.88)'
    pCtx.fill()

    // Bordure fine coloree
    tracerPill(pCtx, lPillX, lPillY, lPillW, PILL_H, PILL_R)
    pCtx.strokeStyle = lCfg.color + (lHovered ? 'cc' : '66')
    pCtx.lineWidth   = 1
    pCtx.stroke()

    // Bande accent coloree (gauche si pill a droite, droite si pill a gauche)
    const lAccX = lRight ? lPillX : lPillX + lPillW - ACCENT_W
    pCtx.beginPath()
    if (lRight) {
      pCtx.moveTo(lAccX + PILL_R, lPillY)
      pCtx.lineTo(lAccX + ACCENT_W, lPillY)
      pCtx.lineTo(lAccX + ACCENT_W, lPillY + PILL_H)
      pCtx.lineTo(lAccX + PILL_R, lPillY + PILL_H)
      pCtx.quadraticCurveTo(lAccX, lPillY + PILL_H, lAccX, lPillY + PILL_H - PILL_R)
      pCtx.lineTo(lAccX, lPillY + PILL_R)
      pCtx.quadraticCurveTo(lAccX, lPillY, lAccX + PILL_R, lPillY)
    } else {
      pCtx.moveTo(lAccX, lPillY)
      pCtx.lineTo(lAccX + ACCENT_W - PILL_R, lPillY)
      pCtx.quadraticCurveTo(lAccX + ACCENT_W, lPillY, lAccX + ACCENT_W, lPillY + PILL_R)
      pCtx.lineTo(lAccX + ACCENT_W, lPillY + PILL_H - PILL_R)
      pCtx.quadraticCurveTo(lAccX + ACCENT_W, lPillY + PILL_H, lAccX + ACCENT_W - PILL_R, lPillY + PILL_H)
      pCtx.lineTo(lAccX, lPillY + PILL_H)
    }
    pCtx.closePath()
    pCtx.fillStyle = lCfg.color
    pCtx.fill()
    pCtx.restore()

    // Texte du pill
    pCtx.save()
    pCtx.globalAlpha   = lNodeFrac
    pCtx.font          = '600 12px system-ui, -apple-system, sans-serif'
    pCtx.fillStyle     = lHovered ? '#ffffff' : 'rgba(220,230,255,0.92)'
    pCtx.textAlign     = 'left'
    pCtx.textBaseline  = 'middle'
    const lTextX = lRight ? lPillX + ACCENT_W + PILL_PAD : lPillX + PILL_PAD
    pCtx.fillText(lLabel, lTextX, lEntry.y - 2)
    pCtx.restore()
  }

  pCtx.restore()
}

// ─── Icône CV sur le tronc ────────────────────────────────────────────────────

function drawCvIcon(pCtx: CanvasRenderingContext2D, pTimeS: number): void {
  if (!treeRoot) return

  const lNodeFrac = Math.min(1, Math.max(0, (growProgress - 0.92) / 0.08))
  if (lNodeFrac <= 0) return

  const lX = treeRoot.ex
  const lY = treeRoot.ey - 14
  cvPos = { x: lX, y: lY }

  const lHovered  = hoveredNodeId === 'cv'
  const lRadius   = (lHovered ? 13 : 10) * lNodeFrac
  const calcPulse = 0.5 + 0.5 * Math.sin(pTimeS * 2.2 + 1.8)
  const calcRingR = lRadius + calcPulse * 7

  pCtx.save()

  // Anneau pulsant
  pCtx.beginPath()
  pCtx.arc(lX, lY, calcRingR, 0, Math.PI * 2)
  pCtx.strokeStyle = '#60a5fa'
  pCtx.globalAlpha = (1 - calcPulse) * 0.4 * lNodeFrac
  pCtx.lineWidth   = 2
  pCtx.stroke()

  // Cercle principal
  pCtx.globalAlpha = lNodeFrac
  pCtx.beginPath()
  pCtx.arc(lX, lY, lRadius, 0, Math.PI * 2)
  pCtx.fillStyle = '#1e40af'
  pCtx.fill()

  // Bordure blanche
  pCtx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
  pCtx.lineWidth   = 2
  pCtx.stroke()

  // Mini icône document
  const lDW = 7, lDH = 9
  const lDX = lX - lDW / 2
  const lDY = lY - lDH / 2

  pCtx.fillStyle   = 'white'
  pCtx.globalAlpha = 0.95
  pCtx.fillRect(lDX, lDY, lDW, lDH)

  pCtx.strokeStyle = '#1e40af'
  pCtx.lineWidth   = 0.9
  pCtx.globalAlpha = 1
  pCtx.beginPath()
  pCtx.moveTo(lDX + 1.5, lDY + 2.5)
  pCtx.lineTo(lDX + lDW - 1.5, lDY + 2.5)
  pCtx.moveTo(lDX + 1.5, lDY + 4.5)
  pCtx.lineTo(lDX + lDW - 1.5, lDY + 4.5)
  pCtx.moveTo(lDX + 1.5, lDY + 6.5)
  pCtx.lineTo(lDX + lDW - 2.5, lDY + 6.5)
  pCtx.stroke()

  pCtx.restore()
}

// Collecte les branches terminales dans le buffer reutilisable (module-level pour eviter redeclaration)
function collectTerminalForFlying(pNode: TreeNode): void {
  if (pNode.children.length === 0) terminalNodesBuffer.push({ ex: pNode.ex, ey: pNode.ey })
  else for (const lC of pNode.children) collectTerminalForFlying(lC)
}

// ─── Boucle de rendu ──────────────────────────────────────────────────────────

function render(pNow: number): void {
  if (!canvasRef.value || !ctx || !treeRoot) return

  const lW      = canvasRef.value.width
  const lH      = canvasRef.value.height
  const lDelta  = lastTimestamp > 0 ? Math.min(pNow - lastTimestamp, 100) : 16
  const lTimeS  = pNow / 1000

  // Mise a jour de la croissance initiale
  if (growProgress < 1) {
    if (growStartTime < 0) growStartTime = pNow
    const lRaw = Math.min(1, (pNow - growStartTime) / GROW_DURATION)
    growProgress = easeOutExpo(lRaw)
    if (lRaw >= 1) growProgress = 1
  }

  ctx.clearRect(0, 0, lW, lH)

  // Tick physique (mise à jour vent + feuilles volantes)
  physics.tick(lDelta)
  const lCfg = computeSeasonConfig(weatherStore.season)

  drawRoots(ctx)
  drawGrass(ctx, lTimeS)
  drawGroundElements(ctx, lTimeS, lW, lH)
  renderNode(ctx, treeRoot, null, 0, lTimeS)

  // Collecte les branches terminales pour l'émission de feuilles volantes
  if (lCfg.leafColors.length > 0) {
    terminalNodesBuffer.length = 0
    collectTerminalForFlying(treeRoot)
  }

  flyingLeaves = physics.updateFlyingLeaves(flyingLeaves, lCfg.leafColors, terminalNodesBuffer)

  drawLeafClusters(ctx)
  drawFlyingLeaves(ctx)

  // Recalcul des positions des noeuds UI (elles bougent avec le vent)
  computeNodePositions()
  drawNodes(ctx, lTimeS)
  drawCvIcon(ctx, lTimeS)

  lastTimestamp = pNow
  rafId = requestAnimationFrame(render)
}

// ─── Hit test ─────────────────────────────────────────────────────────────────

const HIT_RADIUS = 24  // zone cliquable (finger-friendly, px)

function hitTestNode(pX: number, pY: number): NodePosition | null {
  for (const lEntry of nodePositions) {
    // Pill rect
    if (lEntry.pw > 0 &&
        pX >= lEntry.px && pX <= lEntry.px + lEntry.pw &&
        pY >= lEntry.py && pY <= lEntry.py + lEntry.ph) return lEntry
    // Dot d'accroche
    const lDx = pX - lEntry.x, lDy = pY - lEntry.y
    if (Math.sqrt(lDx * lDx + lDy * lDy) < 10) return lEntry
  }
  return null
}

function hitTestCv(pX: number, pY: number): boolean {
  if (!cvPos) return false
  const lDx = pX - cvPos.x
  const lDy = pY - cvPos.y
  return Math.sqrt(lDx * lDx + lDy * lDy) < HIT_RADIUS
}

function getCanvasCoords(pEvent: MouseEvent | TouchEvent): { x: number; y: number } {
  if (!canvasRef.value) return { x: 0, y: 0 }
  const lRect = canvasRef.value.getBoundingClientRect()
  if (pEvent instanceof TouchEvent) {
    const lTouch = pEvent.touches[0] ?? pEvent.changedTouches[0]
    if (!lTouch) return { x: 0, y: 0 }
    return { x: lTouch.clientX - lRect.left, y: lTouch.clientY - lRect.top }
  }
  return { x: pEvent.clientX - lRect.left, y: pEvent.clientY - lRect.top }
}

// ─── Gestionnaires d'événements ───────────────────────────────────────────────

/**
 * mousedown : mémorise quel noeud était sous le curseur au moment du clic.
 */
function onMouseDown(pEvent: MouseEvent): void {
  const { x, y } = getCanvasCoords(pEvent)
  if (hitTestCv(x, y)) { mouseDownNodeId = 'cv'; return }
  mouseDownNodeId = hitTestNode(x, y)?.config.id ?? null
}

/**
 * mouseup : ouvre la modale uniquement si mousedown et mouseup touchent le même noeud.
 * stopPropagation évite que l'événement remonte à l'overlay de la modale.
 */
function onMouseUp(pEvent: MouseEvent): void {
  pEvent.stopPropagation()
  const { x, y } = getCanvasCoords(pEvent)

  if (mouseDownNodeId === 'cv' && hitTestCv(x, y)) {
    window.location.href = '/cv.html'
    mouseDownNodeId = null
    return
  }

  const lEntry = hitTestNode(x, y)
  if (lEntry && lEntry.config.id === mouseDownNodeId) {
    void triggerNodeClick(lEntry)
  }
  mouseDownNodeId = null
}

async function triggerNodeClick(pEntry: NodePosition): Promise<void> {
  // Animation GSAP de rebond sur la branche
  if (import.meta.client && treeRoot) {
    const { gsap } = await import('gsap')
    const lNode = findNodeAtDepth(treeRoot, pEntry.config.depth, pEntry.config.depthIndex)
    if (lNode) {
      const lOrigAngle = lNode.restAngle
      gsap.to(lNode, {
        restAngle: lOrigAngle + 0.06,
        duration: 0.08,
        ease: 'power2.out',
        yoyo: true,
        repeat: 3,
        onComplete: () => { lNode.restAngle = lOrigAngle },
      })
    }
  }
  modal.open(pEntry.config.id)
}

function onMouseMove(pEvent: MouseEvent): void {
  const { x, y } = getCanvasCoords(pEvent)

  if (hitTestCv(x, y)) {
    hoveredNodeId      = 'cv'
    canvasRef.value!.style.cursor = 'pointer'
    labelText.value    = 'CV'
    labelX.value       = cvPos!.x
    labelY.value       = cvPos!.y
    labelVisible.value = true
    return
  }

  const lEntry = hitTestNode(x, y)
  if (lEntry) {
    hoveredNodeId = lEntry.config.id
    canvasRef.value!.style.cursor = 'pointer'
    labelVisible.value = false  // label visible dans le pill, pas de tooltip
  } else {
    hoveredNodeId = null
    if (canvasRef.value) canvasRef.value.style.cursor = 'default'
    labelVisible.value = false
  }
}

function onMouseLeave(): void {
  hoveredNodeId = null
  mouseDownNodeId = null
  labelVisible.value = false
  if (canvasRef.value) canvasRef.value.style.cursor = 'default'
}

function onTouchEnd(pEvent: TouchEvent): void {
  pEvent.preventDefault()
  pEvent.stopPropagation()
  const { x, y } = getCanvasCoords(pEvent)
  if (hitTestCv(x, y)) { window.location.href = '/cv.html'; return }
  const lEntry = hitTestNode(x, y)
  if (lEntry) void triggerNodeClick(lEntry)
}

// ─── Resize ───────────────────────────────────────────────────────────────────

function resetCanvas(): void {
  if (!canvasRef.value) return
  canvasRef.value.width  = window.innerWidth
  canvasRef.value.height = window.innerHeight
  buildTree(canvasRef.value.width, canvasRef.value.height, weatherStore.season)
  flyingLeaves = []
}

let resizeTimer = 0
function onResize(): void {
  clearTimeout(resizeTimer)
  resizeTimer = window.setTimeout(resetCanvas, 150)
}

// ─── Visibilite de l'onglet ───────────────────────────────────────────────────

function onVisibilityChange(): void {
  if (document.hidden) {
    cancelAnimationFrame(rafId)
  } else {
    lastTimestamp = 0  // reset pour eviter un delta enorme au retour
    rafId = requestAnimationFrame(render)
  }
}

// ─── Réactivité ───────────────────────────────────────────────────────────────

watch(() => weatherStore.season, () => resetCanvas())

// ─── Cycle de vie ─────────────────────────────────────────────────────────────

onMounted(() => {
  if (!canvasRef.value) return
  ctx = canvasRef.value.getContext('2d')
  canvasRef.value.width  = window.innerWidth
  canvasRef.value.height = window.innerHeight
  buildTree(canvasRef.value.width, canvasRef.value.height, weatherStore.season)
  rafId = requestAnimationFrame(render)
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibilityChange)
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(resizeTimer)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<template>
  <div class="tree-wrapper">
    <canvas
      ref="canvasRef"
      class="canvas-tree"
      @mousemove="onMouseMove"
      @mouseleave="onMouseLeave"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @touchend.prevent="onTouchEnd"
    />

    <!-- Label tooltip -->
    <Transition name="label-fade">
      <div
        v-if="labelVisible"
        class="tree-node-label"
        :style="{
          position: 'fixed',
          left: `${labelX}px`,
          top:  `${labelY - 18}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 10,
          pointerEvents: 'none',
        }"
        aria-hidden="true"
      >
        {{ labelText }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.tree-wrapper {
  position: fixed;
  inset: 0;
  z-index: 4;
}

.canvas-tree {
  display: block;
  width: 100%;
  height: 100%;
}

.label-fade-enter-active,
.label-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.label-fade-enter-from,
.label-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-100% - 6px));
}
</style>
