// app/plugins/vuetify.ts
import '@mdi/font/css/materialdesignicons.css'
import '@fortawesome/fontawesome-free/css/all.css'
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa'
export default defineNuxtPlugin((app) => {
  const vuetify = createVuetify({
    // ssr: false, // Disabling SSR components prevents hydration race conditions
    icons: {
      aliases,
      sets: {
        fa,
      },
    }
  })

  app.vueApp.use(vuetify)
})