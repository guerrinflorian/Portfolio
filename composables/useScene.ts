// Auteur : GUERRINF - Florian Guerrin
// Composable - application du thème via CSS custom properties + GSAP

import { watch, onMounted } from 'vue'
import { useSceneStore } from '~/stores/scene'

/**
 * Tweene les CSS custom properties du ciel via GSAP pour des transitions fluides.
 * À utiliser dans SceneBackground.vue.
 */
export function useScene() {
  const sceneStore = useSceneStore()

  /**
   * Applique les couleurs de ciel sur :root via GSAP (transition douce 2s).
   */
  async function applySkyTheme(pTop: string, pBottom: string): Promise<void> {
    if (!import.meta.client) return

    const { gsap } = await import('gsap')

    gsap.to(document.documentElement, {
      '--sky-top': pTop,
      '--sky-bottom': pBottom,
      duration: 2,
      ease: 'power1.inOut',
    })

    // Variables de modale sans transition (changement immédiat)
    document.documentElement.style.setProperty('--modal-bg',     sceneStore.theme.modalBg)
    document.documentElement.style.setProperty('--modal-border', sceneStore.theme.modalBorder)
    document.documentElement.style.setProperty('--modal-text',   sceneStore.theme.modalText)
  }

  onMounted(() => {
    // Application initiale immédiate (sans GSAP)
    document.documentElement.style.setProperty('--sky-top',    sceneStore.skyTop)
    document.documentElement.style.setProperty('--sky-bottom', sceneStore.skyBottom)

    // Surveillance des changements de thème → transition douce
    watch(
      () => sceneStore.theme,
      (lTheme) => void applySkyTheme(lTheme.skyPalette.top, lTheme.skyPalette.bottom),
      { deep: true }
    )
  })

  return { sceneStore }
}
