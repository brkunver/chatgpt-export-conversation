<script lang="ts" setup>
import devlog from "@/utils/dev-log"
import type { ConversationExportFormat } from "@/utils/get-conversation"
import { ref } from "vue"
import Toggle from "@/components/toggle.vue"

import { i18n } from "#imports"

const includeUserToggle = ref(false)
const includeRoleNamesToggle = ref(false)
const errorMessage = ref("")

const userPromptsId = "user-prompts"
const roleNamesId = "role-names"

function logChatHandler(exportFormat: ConversationExportFormat) {
  errorMessage.value = ""
  browser.tabs.query({}, function (tabs) {
    const targetTab = tabs.find(function (tab) {
      return tab.url && tab.url.startsWith("https://chatgpt.com/c/")
    })
    if (!targetTab) {
      errorMessage.value = i18n.t("content.chatGptTabNotFound")
      return
    }
    devlog("logChatHandler called")
    browser.runtime
      .sendMessage({
        action: "logContent",
        exportFormat,
        includeUser: includeUserToggle.value,
        includeRoleNames: includeRoleNamesToggle.value,
      })
      .then(function () {
        devlog("logChatHandler done")
      })
      .catch(function () {
        devlog("logChatHandler error")
      })
  })
}

function toggleIncludeUser(check: boolean) {
  includeUserToggle.value = check
}

function toggleIncludeRoleNames(check: boolean) {
  includeRoleNamesToggle.value = check
}
</script>

<template>
  <main
    class="w-[320px] bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_42%),linear-gradient(180deg,#f8fbff_0%,#edf4ff_100%)] p-3 text-slate-900"
  >
    <section
      class="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-4 shadow-[0_22px_60px_rgba(15,23,42,0.12)] backdrop-blur-sm"
    >
      <div class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500"></div>

      <div class="mb-4 text-center">
        <h1
          class="bg-gradient-to-r from-sky-700 via-cyan-700 to-emerald-700 bg-clip-text text-2xl font-black tracking-tight text-transparent"
        >
          {{ i18n.t("extensionName") }}
        </h1>
      </div>

      <div
        v-if="errorMessage"
        role="alert"
        class="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 shadow-sm"
      >
        {{ errorMessage }}
      </div>

      <div class="space-y-3">
        <div
          class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 shadow-sm transition hover:border-sky-200 hover:bg-white"
        >
          <label :for="userPromptsId" class="cursor-pointer select-none text-sm font-semibold text-slate-700">
            {{ i18n.t("content.includeUserPrompts") }}
          </label>
          <Toggle :id="userPromptsId" :set-checked="toggleIncludeUser" />
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-3 shadow-sm transition hover:border-sky-200 hover:bg-white"
        >
          <label :for="roleNamesId" class="cursor-pointer select-none text-sm font-semibold text-slate-700">
            {{ i18n.t("content.includeRoleNames") }}
          </label>
          <Toggle :id="roleNamesId" :set-checked="toggleIncludeRoleNames" />
        </div>
      </div>

      <div class="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          class="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-3 py-3 text-sm font-semibold leading-tight text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 active:translate-y-0"
          @click="logChatHandler('txt')"
        >
          {{ i18n.t("content.downloadAsTxt") }}
        </button>
        <button
          type="button"
          class="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-cyan-200 bg-cyan-50 px-3 py-3 text-sm font-semibold leading-tight text-cyan-900 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 active:translate-y-0"
          @click="logChatHandler('markdown')"
        >
          {{ i18n.t("content.downloadAsMarkdown") }}
        </button>
      </div>
    </section>
  </main>
</template>
