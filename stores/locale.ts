// Auteur : GUERRINF - Florian Guerrin
// Store - langue active (FR / EN) via useCookie Nuxt (fonctionne SSR + client sans conflit)

import { defineStore } from 'pinia'
import { computed } from 'vue'

export type Locale = 'fr' | 'en'

export const useLocaleStore = defineStore('locale', () => {
  // useCookie est isomorphe : lu côté serveur et client sans hydratation conflictuelle
  const mCookie = useCookie<Locale>('portfolio-locale', {
    default: () => 'fr',
    maxAge: 60 * 60 * 24 * 365, // 1 an
    sameSite: 'lax',
  })

  const mLocale = computed(() => mCookie.value)

  function toggleLocale(): void {
    mCookie.value = mCookie.value === 'fr' ? 'en' : 'fr'
  }

  return { mLocale, toggleLocale }
})
