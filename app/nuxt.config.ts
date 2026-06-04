import tailwindcss from "@tailwindcss/vite";
import vuetify, { transformAssetUrls } from 'vite-plugin-vuetify';
import { fileURLToPath } from "node:url";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  build: {
    transpile: ['vuetify'],
  },
  vite: {
      plugins: [
        tailwindcss(),
    vuetify({ autoImport: true }),
    ],
    vue: {
      template: {
        transformAssetUrls,
      },
    },
  },
  alias: {
    "@backend": fileURLToPath(new URL("../src", import.meta.url))
  },
})
