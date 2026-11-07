// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  srcDir: '.',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss'],

  // Google Fonts loaded via CSS @import in tailwind.css
  app: {
    head: {
      title: 'Budgetty',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#6C63FF' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    // Private – never exposed to the client bundle.
    // Nuxt maps env vars automatically:
    //   NUXT_GAS_URL   → runtimeConfig.gasUrl
    //   NUXT_API_TOKEN → runtimeConfig.apiToken
    gasUrl: '',
    apiToken: '',
  },

  typescript: {
    strict: true,
  },
})
