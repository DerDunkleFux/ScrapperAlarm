import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
      plugins: [
        tailwindcss(),
      ],
    },
  alias: {
    "@backend": fileURLToPath(new URL("../src", import.meta.url))
  },
})
