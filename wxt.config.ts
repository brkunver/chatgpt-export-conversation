import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue"],
  manifest: {
    permissions: ["tabs"],
  },
  webExt: {
    disabled: true,
  },
  vite: () => ({
    plugins: [tailwindcss() as any],
  }),
})
