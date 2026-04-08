// Auteur : GUERRINF - Florian Guerrin
// Composable - accès à la locale active + helper t(fr, en)

import { storeToRefs } from 'pinia'
import { useLocaleStore } from '~/stores/locale'

export function useLocale() {
  const lStore = useLocaleStore()
  const { mLocale } = storeToRefs(lStore)

  function t(pFr: string, pEn: string): string {
    return mLocale.value === 'fr' ? pFr : pEn
  }

  return { t, locale: mLocale, toggleLocale: lStore.toggleLocale }
}
