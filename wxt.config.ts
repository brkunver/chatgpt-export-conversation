import { defineConfig } from "wxt"
import tailwindcss from "@tailwindcss/vite"

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-vue", "@wxt-dev/i18n/module"],
  manifest: {
    default_locale: "en",
    permissions: ["tabs"],
    name: "__MSG_extensionName__",
    description: "__MSG_extensionDescription__",
  },
  webExt: {
    disabled: true,
  },
  vite: () => ({
    plugins: [tailwindcss() as any],
  }),
})
