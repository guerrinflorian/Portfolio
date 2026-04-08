// Auteur : GUERRINF - Florian Guerrin
// Plugin client - initialise la locale depuis localStorage APRES l'hydratation Pinia
// Le suffixe .client.ts garantit que ce plugin ne tourne que dans le navigateur

import { useLocaleStore } from '~/stores/locale'

export default defineNuxtPlugin({
  name: 'locale-init',
  enforce: 'post',
  setup() {
    useLocaleStore().initLocale()
  },
})
