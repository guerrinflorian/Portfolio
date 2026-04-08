// Auteur : GUERRINF - Florian Guerrin
// Store - langue active (FR / EN)
// Toujours initialisé à 'fr' pour correspondre au HTML généré (pas de mismatch SSR)
// La locale réelle est appliquée après montage via initLocale()

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { skipHydrate } from 'pinia'

export type Locale = 'fr' | 'en'

export const useLocaleStore = defineStore('locale', () => {
  const mLocale = ref<Locale>('fr')

  function toggleLocale(): void {
    mLocale.value = mLocale.value === 'fr' ? 'en' : 'fr'
    localStorage.setItem('portfolio-locale', mLocale.value)
  }

  // Appelé après hydratation - lit localStorage sans provoquer de mismatch
  function initLocale(): void {
    const lSaved = localStorage.getItem('portfolio-locale')
    if (lSaved === 'en') mLocale.value = 'en'
  }

  return { mLocale: skipHydrate(mLocale), toggleLocale, initLocale }
})
