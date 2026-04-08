// Auteur : GUERRINF - Florian Guerrin
// Composable - accès à la locale active + helper t(fr, en)

import { computed } from 'vue'
import { useLocaleStore } from '~/stores/locale'

export function useLocale() {
  const lStore = useLocaleStore()

  // Retourne pFr ou pEn selon la langue active
  function t(pFr: string, pEn: string): string {
    return lStore.mLocale === 'fr' ? pFr : pEn
  }

  const locale = computed(() => lStore.mLocale)

  return { t, locale, toggleLocale: lStore.toggleLocale }
}
