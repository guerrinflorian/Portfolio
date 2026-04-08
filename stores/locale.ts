// Auteur : GUERRINF - Florian Guerrin
// Store - langue active (FR / EN)
// skipHydrate : Pinia ne serialise pas mLocale dans window.__NUXT__
// donc le payload SSR ne peut pas ecraser la valeur lue dans localStorage

import { defineStore } from 'pinia'
import { ref } from 'vue'
import { skipHydrate } from 'pinia'

export type Locale = 'fr' | 'en'

function calcInitialLocale(): Locale {
  if (!import.meta.client) return 'fr'
  const lSaved = localStorage.getItem('portfolio-locale')
  return lSaved === 'en' ? 'en' : 'fr'
}

export const useLocaleStore = defineStore('locale', () => {
  // Initialisé directement depuis localStorage - skipHydrate empeche l'ecrasement SSR
  const mLocale = ref<Locale>(calcInitialLocale())

  function toggleLocale(): void {
    mLocale.value = mLocale.value === 'fr' ? 'en' : 'fr'
    localStorage.setItem('portfolio-locale', mLocale.value)
  }

  return { mLocale: skipHydrate(mLocale), toggleLocale }
})
