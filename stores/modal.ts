// Auteur : GUERRINF - Florian Guerrin
// Store Pinia - gestion des modales

import { defineStore } from 'pinia'
import type { ModalId, ModalStoreState } from '~/types/modal'

// Durées d'animation - synchronisées avec ModalBase.vue
const OPEN_ANIM_MS = 350
const CLOSE_ANIM_MS = 250

export const useModalStore = defineStore('modal', {
  state: (): ModalStoreState => ({
    activeModal: null,
    isAnimating: false,
  }),

  getters: {
    /**
     * Retourne true si la modale donnée est active.
     */
    isOpen: (state) => (pId: ModalId): boolean => state.activeModal === pId,

    /**
     * Retourne true si n'importe quelle modale est ouverte.
     */
    anyOpen: (state): boolean => state.activeModal !== null,
  },

  actions: {
    /**
     * Ouvre une modale. Bloque si une animation est en cours.
     */
    open(pId: ModalId): void {
      if (this.isAnimating) return
      this.isAnimating = true
      this.activeModal = pId
      // Libère le verrou après la durée d'ouverture
      setTimeout(() => { this.isAnimating = false }, OPEN_ANIM_MS)
    },

    /**
     * Ferme la modale active. Bloque si une animation est en cours.
     */
    close(): void {
      if (this.isAnimating) return
      this.isAnimating = true
      this.activeModal = null
      // Libère le verrou après la durée de fermeture
      setTimeout(() => { this.isAnimating = false }, CLOSE_ANIM_MS)
    },

    /**
     * Contrôle manuel du verrou d'animation (usage interne).
     */
    setAnimating(pValue: boolean): void {
      this.isAnimating = pValue
    },
  },
})
