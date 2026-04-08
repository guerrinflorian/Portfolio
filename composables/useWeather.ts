// Auteur : GUERRINF - Florian Guerrin
// Composable - intégration météo dans les composants Vue

import { onMounted, onUnmounted, watch } from 'vue'
import { useWeatherStore } from '~/stores/weather'
import { useSceneStore } from '~/stores/scene'

// Extension de Window pour les nettoyages globaux
interface WindowWithCleanup extends Window {
  __weatherCleanup__?: () => void
}

/**
 * Composable qui démarre la récupération météo et synchronise
 * le store de scène à chaque mise à jour.
 *
 * À utiliser UNE SEULE FOIS dans le composant racine (index.vue).
 */
export function useWeather() {
  const weatherStore = useWeatherStore()
  const sceneStore   = useSceneStore()

  let stopRefresh: (() => void) | null = null

  /**
   * Synchronise le thème de scène avec les données météo actuelles.
   */
  function syncScene(): void {
    sceneStore.updateTheme(
      weatherStore.timeOfDay,
      weatherStore.state,
      weatherStore.season,
      weatherStore.isDay
    )
  }

  onMounted(() => {
    stopRefresh = weatherStore.startAutoRefresh()

    // Synchronise la scène toutes les 30 secondes (heure locale peut évoluer)
    const lSceneInterval = setInterval(syncScene, 30_000)

    // Surveille les changements du store météo
    const lUnwatch = watch(
      () => [weatherStore.state, weatherStore.timeOfDay, weatherStore.season] as const,
      () => syncScene(),
      { immediate: true }
    )

    // Stockage pour nettoyage dans onUnmounted
    const lWin = window as WindowWithCleanup
    lWin.__weatherCleanup__ = () => {
      clearInterval(lSceneInterval)
      lUnwatch()
    }
  })

  onUnmounted(() => {
    stopRefresh?.()
    const lWin = window as WindowWithCleanup
    if (typeof lWin.__weatherCleanup__ === 'function') {
      lWin.__weatherCleanup__()
      delete lWin.__weatherCleanup__
    }
  })

  return { weatherStore, sceneStore }
}
