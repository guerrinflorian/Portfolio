// Auteur : GUERRINF - Florian Guerrin
// Composable - physique du vent sur l'arbre (oscillation, feuilles volantes)

import { ref, watch } from 'vue'
import { useWeatherStore } from '~/stores/weather'
import type { FlyingLeaf, WindState } from '~/types/tree'

// ─── Constantes ───────────────────────────────────────────────────────────────

const MAX_AMPLITUDE_RAD       = 0.18  // Amplitude maximale d'oscillation (rad)
const FLYING_LEAF_THRESHOLD   = 25    // Vitesse vent seuil d'émission de feuilles (km/h)
const WIND_LERP_DURATION_MS   = 2000  // Durée de transition de vitesse vent
const LEAF_LIFETIME_FRAMES    = 140   // Durée de vie d'une feuille volante (frames)

// ─── Types internes ───────────────────────────────────────────────────────────

/** Référence minimale à une branche terminale pour l'émission de feuilles */
interface TerminalBranch {
  ex: number
  ey: number
}

// ─── Fonctions pures ──────────────────────────────────────────────────────────

function lerp(pA: number, pB: number, pT: number): number {
  return pA + (pB - pA) * Math.min(pT, 1)
}

function computeSwingAngle(pFreq: number, pPhase: number, pTimeS: number, pAmplitude: number): number {
  return Math.sin(pTimeS * pFreq + pPhase) * pAmplitude
}

function createFlyingLeaf(pBranch: TerminalBranch, pColors: string[]): FlyingLeaf {
  const lColor = pColors[Math.floor(Math.random() * pColors.length)] ?? '#D2691E'
  return {
    x: pBranch.ex + (Math.random() - 0.5) * 20,
    y: pBranch.ey + (Math.random() - 0.5) * 20,
    vx: (Math.random() - 0.5) * 3,
    vy: Math.random() * -2 - 0.5,
    angle: Math.random() * Math.PI * 2,
    angularVelocity: (Math.random() - 0.5) * 0.15,
    width: 8 + Math.random() * 6,
    height: 4 + Math.random() * 4,
    color: lColor,
    alpha: 0.7 + Math.random() * 0.3,
    life: 1,
  }
}

// ─── Composable ───────────────────────────────────────────────────────────────

export function useTreePhysics() {
  const weatherStore = useWeatherStore()

  const windState = ref<WindState>({
    currentSpeed: weatherStore.windSpeed,
    targetSpeed:  weatherStore.windSpeed,
    maxAmplitude: MAX_AMPLITUDE_RAD,
    lastUpdate:   Date.now(),
  })

  // Synchronisation de la vitesse cible avec le store météo
  watch(
    () => weatherStore.windSpeed,
    (pNewSpeed) => { windState.value.targetSpeed = pNewSpeed }
  )

  /**
   * Met à jour la vitesse de vent par lerp progressif.
   * À appeler à chaque frame.
   */
  function updateWind(pDeltaMs: number): void {
    const lT = pDeltaMs / WIND_LERP_DURATION_MS
    windState.value.currentSpeed = lerp(
      windState.value.currentSpeed,
      windState.value.targetSpeed,
      lT
    )
  }

  /**
   * Calcule le delta angulaire d'oscillation pour une branche donnée.
   * L'amplitude augmente avec la profondeur (les extrémités bougent plus).
   */
  function computeBranchWindDelta(pFreq: number, pPhase: number, pDepth: number, pTimeS: number): number {
    const calcAmplitude = (windState.value.currentSpeed / 60) * MAX_AMPLITUDE_RAD * (1 + pDepth * 0.22)
    return computeSwingAngle(pFreq, pPhase, pTimeS, calcAmplitude)
  }

  /**
   * Met à jour les feuilles volantes (physique + émission).
   * Retourne le tableau mis à jour (feuilles mortes supprimées).
   */
  function updateFlyingLeaves(
    pLeaves: FlyingLeaf[],
    pColors: string[],
    pTerminalBranches: TerminalBranch[]
  ): FlyingLeaf[] {
    const lSpeed = windState.value.currentSpeed

    // Émission de nouvelles feuilles si vent fort
    if (lSpeed > FLYING_LEAF_THRESHOLD && Math.random() < 0.05 && pTerminalBranches.length > 0) {
      const lBranch = pTerminalBranches[Math.floor(Math.random() * pTerminalBranches.length)]!
      pLeaves.push(createFlyingLeaf(lBranch, pColors))
    }

    // Mise à jour et filtrage
    return pLeaves
      .map((lLeaf) => {
        const lNewVx = lLeaf.vx + (lSpeed / 100) * 0.2
        return {
          ...lLeaf,
          x:     lLeaf.x + lNewVx,
          y:     lLeaf.y + lLeaf.vy + 0.3,
          vy:    lLeaf.vy + 0.05,
          vx:    lNewVx,
          angle: lLeaf.angle + lLeaf.angularVelocity,
          alpha: lLeaf.alpha * (lLeaf.life > 0.3 ? 1 : lLeaf.life / 0.3),
          life:  lLeaf.life - 1 / LEAF_LIFETIME_FRAMES,
        }
      })
      .filter((lLeaf) => lLeaf.life > 0)
  }

  /**
   * Tick de physique - à appeler dans le requestAnimationFrame.
   */
  function tick(pDeltaMs: number): void {
    updateWind(pDeltaMs)
  }

  return {
    windState,
    tick,
    computeBranchWindDelta,
    updateFlyingLeaves,
  }
}
