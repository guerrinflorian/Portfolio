// Auteur : GUERRINF - Florian Guerrin
// Plugin client - applique la locale sauvegardée APRES hydratation complète
// app:mounted garantit qu'on ne touche pas au DOM avant que Vue ait fini de comparer

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hook('app:mounted', () => {
    useLocaleStore().initLocale()
  })
})
