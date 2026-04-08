// Auteur : GUERRINF - Florian Guerrin
// Store - langue active (FR / EN), persistée en localStorage

import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Locale = 'fr' | 'en'

export const useLocaleStore = defineStore('locale', () => {
  const mLocale = ref<Locale>('fr')

  function toggleLocale(): void {
    mLocale.value = mLocale.value === 'fr' ? 'en' : 'fr'
    if (import.meta.client) {
      localStorage.setItem('portfolio-locale', mLocale.value)
    }
  }

  function initLocale(): void {
    if (!import.meta.client) return
    const lSaved = localStorage.getItem('portfolio-locale') as Locale | null
    if (lSaved === 'fr' || lSaved === 'en') mLocale.value = lSaved
  }

  return { mLocale, toggleLocale, initLocale }
})
