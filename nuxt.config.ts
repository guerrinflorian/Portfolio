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
      title: 'Florian Guerrin - Developpeur Full-Stack Vue.js et TypeScript',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Portfolio de Florian Guerrin, developpeur full-stack Vue.js, TypeScript et SQL Server. Base a Bure / Tressange en Moselle, pres du Luxembourg. Specialiste applications intranet industrielles.',
        },
        { name: 'author', content: 'Florian Guerrin' },
        { name: 'keywords', content: 'Florian Guerrin, developpeur Vue.js, TypeScript, SQL Server, Moselle, Luxembourg, full-stack, portfolio' },
        { name: 'robots', content: 'index, follow' },
        { name: 'theme-color', content: '#1e90ff' },

        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'fr_FR' },
        { property: 'og:site_name', content: 'Florian Guerrin' },
        { property: 'og:url', content: 'https://florian-guerrin.fr' },
        { property: 'og:title', content: 'Florian Guerrin - Developpeur Full-Stack Vue.js et TypeScript' },
        {
          property: 'og:description',
          content:
            'Developpeur full-stack specialise Vue.js, TypeScript et SQL Server. Base en Moselle, pres du Luxembourg. Applications intranet industrielles, infrastructure VPS, projets creatifs.',
        },
        { property: 'og:image', content: 'https://florian-guerrin.fr/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'Florian Guerrin - Developpeur Full-Stack' },

        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'Florian Guerrin - Developpeur Full-Stack Vue.js et TypeScript' },
        {
          name: 'twitter:description',
          content:
            'Developpeur full-stack specialise Vue.js, TypeScript et SQL Server. Base en Moselle, pres du Luxembourg.',
        },
        { name: 'twitter:image', content: 'https://florian-guerrin.fr/og-image.png' },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'canonical', href: 'https://florian-guerrin.fr' },
      ],
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
      latitude: '49.4167',
      longitude: '6.0000',
    },
  },

  // Nitro - preset node-server pour VPS (nuxt build + node .output/server/index.mjs)
  nitro: {
    preset: 'node-server',
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
