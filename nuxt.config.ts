// Auteur : GUERRINF - Florian Guerrin
// Configuration Nuxt 3 - portfolio statique SSG

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: false },

  // Génération statique
  ssr: true,

  // Modules
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
  ],

  // CSS global
  css: ['~/assets/css/main.css'],

  // Configuration app
  app: {
    head: {
      title: 'Florian Guerrin - Développeur Vue.js & SQL Server',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Portfolio de Florian Guerrin, développeur Vue.js / TypeScript / SQL Server basé à Tressange, Moselle - à la frontière luxembourgeoise.',
        },
        { property: 'og:title', content: 'Florian Guerrin - Développeur Vue.js & SQL Server' },
        {
          property: 'og:description',
          content:
            'Applications intranet industrielles, Vue 3, TypeScript, SQL Server. Basé en Moselle / Luxembourg.',
        },
        { property: 'og:image', content: '/og-image.png' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'fr_FR' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'robots', content: 'index, follow' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
      htmlAttrs: { lang: 'fr' },
    },
  },

  // TypeScript strict
  typescript: {
    strict: true,
    typeCheck: false, // Désactivé en dev pour la vitesse, activer en CI
  },

  // Variables d'environnement runtime
  runtimeConfig: {
    public: {
      openMeteoUrl: 'https://api.open-meteo.com/v1/forecast',
      latitude: '49.3897',
      longitude: '6.0731',
    },
  },

  // Nitro - preset Vercel + prerender
  nitro: {
    preset: 'vercel',
    prerender: {
      routes: ['/'],
    },
  },

  // Vite - optimisation bundle
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            gsap: ['gsap'],
          },
        },
      },
    },
  },
})
