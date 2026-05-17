<script lang="ts" setup>
import devlog from "@/utils/dev-log"
import type { ConversationExportFormat } from "@/utils/get-conversation"
import { onMounted, onUnmounted, ref } from "vue"
import Toggle from "@/components/toggle.vue"
import type { ExportErrorCode, ExportResponse } from "@/utils/export-flow"
import { defaultExportPreferences, exportPreferencesStorage, type ExportPreferences } from "@/utils/store"

import { i18n } from "#imports"

const includeUserToggle = ref(true)
const includeRoleNamesToggle = ref(true)
const includeImagesToggle = ref(true)
const errorMessage = ref("")
const isExporting = ref(false)

const userPromptsId = "user-prompts"
const roleNamesId = "role-names"
const imagesId = "images"
let savePreferencesQueue = Promise.resolve()

function resolveErrorMessage(errorCode: ExportErrorCode) {
  switch (errorCode) {
    case "no_chatgpt_site":
      return i18n.t("content.chatGptTabNotFound")
    case "no_messages_found":
      return i18n.t("content.conversationNotFound")
    case "content_script_unavailable":
      return i18n.t("content.contentScriptUnavailable")
    case "download_failed":
      return i18n.t("content.downloadFailed")
    case "unexpected_error":
      return i18n.t("content.unexpectedError")
  }
}

function applyExportPreferences(preferences: ExportPreferences) {
  includeUserToggle.value = preferences.includeUser
  includeRoleNamesToggle.value = preferences.includeRoleNames
  includeImagesToggle.value = preferences.includeImages
}

function saveExportPreferences() {
  const preferences: ExportPreferences = {
    includeUser: includeUserToggle.value,
    includeRoleNames: includeRoleNamesToggle.value,
    includeImages: includeImagesToggle.value,
  }

  savePreferencesQueue = savePreferencesQueue
    .catch(() => undefined)
    .then(() => exportPreferencesStorage.setValue(preferences))
    .catch(error => {
      devlog("saveExportPreferences error", error)
    })
}

onMounted(async () => {
  const storedPreferences = await exportPreferencesStorage.getValue()

  applyExportPreferences({
    ...defaultExportPreferences,
    ...storedPreferences,
  })
})

const unwatchExportPreferences = exportPreferencesStorage.watch(newPreferences => {
  applyExportPreferences({
    ...defaultExportPreferences,
    ...newPreferences,
  })
})

onUnmounted(() => {
  unwatchExportPreferences()
})

async function logChatHandler(exportFormat: ConversationExportFormat) {
  if (isExporting.value) {
    return
  }

  isExporting.value = true
  errorMessage.value = ""

  try {
    devlog("logChatHandler called")
    const response = (await browser.runtime.sendMessage({
      action: "logContent",
      exportFormat,
      includeUser: includeUserToggle.value,
      includeRoleNames: includeRoleNamesToggle.value,
      includeImages: includeImagesToggle.value,
    })) as ExportResponse | undefined

    if (!response || !response.ok) {
      const errorCode = response?.ok === false ? response.errorCode : "unexpected_error"
      errorMessage.value = resolveErrorMessage(errorCode)
      return
    }

    devlog("logChatHandler done")
  } catch (error) {
    devlog("logChatHandler error", error)
    errorMessage.value = resolveErrorMessage("unexpected_error")
  } finally {
    isExporting.value = false
  }
}

function toggleIncludeUser(check: boolean) {
  includeUserToggle.value = check
  saveExportPreferences()
}

function toggleIncludeRoleNames(check: boolean) {
  includeRoleNamesToggle.value = check
  saveExportPreferences()
}

function toggleIncludeImages(check: boolean) {
  includeImagesToggle.value = check
  saveExportPreferences()
}
</script>

<template>
  <main
    class="relative w-[320px] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_38%),linear-gradient(180deg,#0f172a_0%,#111827_52%,#0b1220_100%)] px-3 py-3 text-slate-50"
  >
    <div
      class="pointer-events-none absolute -top-24 right-[-56px] h-44 w-44 rounded-full bg-cyan-400/20 blur-3xl"
    ></div>
    <div
      class="pointer-events-none absolute bottom-[-64px] left-[-72px] h-44 w-44 rounded-full bg-sky-500/15 blur-3xl"
    ></div>

    <div class="relative space-y-4">
      <header class="text-center">
        <h1 class="text-[1.65rem] leading-tight font-black tracking-tight text-white">
          {{ i18n.t("extensionName") }}
        </h1>
        <p class="mt-1 text-sm text-slate-300">
          {{ i18n.t("extensionDescription") }}
        </p>
      </header>

      <div
        v-if="errorMessage"
        role="alert"
        class="rounded-2xl border border-rose-400/20 bg-rose-500/15 px-3 py-2 text-sm font-medium text-rose-100 shadow-sm"
      >
        {{ errorMessage }}
      </div>

      <div class="space-y-3">
        <div
          class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-white/8"
        >
          <label :for="userPromptsId" class="cursor-pointer text-sm font-semibold text-slate-100 select-none">
            {{ i18n.t("content.includeUserPrompts") }}
          </label>
          <Toggle :id="userPromptsId" :checked="includeUserToggle" :set-checked="toggleIncludeUser" />
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-white/8"
        >
          <label :for="roleNamesId" class="cursor-pointer text-sm font-semibold text-slate-100 select-none">
            {{ i18n.t("content.includeRoleNames") }}
          </label>
          <Toggle :id="roleNamesId" :checked="includeRoleNamesToggle" :set-checked="toggleIncludeRoleNames" />
        </div>

        <div
          class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-white/8"
        >
          <label :for="imagesId" class="cursor-pointer text-sm font-semibold text-slate-100 select-none">
            {{ i18n.t("content.includeImages") }}
          </label>
          <Toggle :id="imagesId" :checked="includeImagesToggle" :set-checked="toggleIncludeImages" />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <button
          type="button"
          :disabled="isExporting"
          class="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-3 py-3 text-sm leading-tight font-semibold text-white shadow-lg shadow-slate-950/30 transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          @click="logChatHandler('txt')"
        >
          {{ i18n.t("content.downloadAsTxt") }}
        </button>
        <button
          type="button"
          :disabled="isExporting"
          class="inline-flex min-h-12 cursor-pointer items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-400/10 px-3 py-3 text-sm leading-tight font-semibold text-cyan-100 shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300/60 hover:bg-cyan-300/15 focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          @click="logChatHandler('markdown')"
        >
          {{ i18n.t("content.downloadAsMarkdown") }}
        </button>
      </div>
    </div>
  </main>
</template>
