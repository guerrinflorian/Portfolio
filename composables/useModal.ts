// Auteur : GUERRINF - Florian Guerrin
// Composable - accès simplifié au store de modales

import { useModalStore } from '~/stores/modal'
import type { ModalId } from '~/types/modal'

/**
 * Wrapper léger autour du store Pinia modal.
 * Expose une API concise pour les composants.
 */
export function useModal() {
  const store = useModalStore()

  return {
    /** Ouvre une modale par son identifiant */
    open:    (pId: ModalId) => store.open(pId),
    /** Ferme la modale active */
    close:   ()             => store.close(),
    /** Retourne true si la modale donnée est active */
    isOpen:  (pId: ModalId) => store.isOpen(pId),
    /** Retourne true si n'importe quelle modale est ouverte */
    anyOpen: ()             => store.anyOpen,
    /** Store complet pour les cas avancés */
    store,
  }
}
