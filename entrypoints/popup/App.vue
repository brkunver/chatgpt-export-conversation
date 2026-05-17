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
  <main class="flex min-w-[300px] flex-col justify-center gap-4 p-4 text-center">
    <h1 class="text-2xl font-bold">{{ i18n.t("extensionName") }}</h1>
    <div v-if="errorMessage" class="mb-2 rounded bg-red-100 px-4 py-2 text-base font-medium text-red-700">
      {{ errorMessage }}
    </div>
    <div class="flex items-center gap-2">
      <Toggle :id="userPromptsId" :set-checked="toggleIncludeUser" />
      <label :for="userPromptsId" class="text-lg text-blue-900 select-none">{{
        i18n.t("content.includeUserPrompts")
      }}</label>
    </div>
    <div class="flex items-center gap-2">
      <Toggle :id="roleNamesId" :set-checked="toggleIncludeRoleNames" />
      <label :for="roleNamesId" class="text-lg text-blue-900 select-none">{{
        i18n.t("content.includeRoleNames")
      }}</label>
    </div>
    <div class="grid grid-cols-2 gap-2">
      <button
        class="cursor-pointer rounded bg-black px-2 py-2 text-center text-base leading-tight text-white"
        @click="logChatHandler('txt')"
      >
        {{ i18n.t("content.downloadAsTxt") }}
      </button>
      <button
        class="cursor-pointer rounded bg-black px-2 py-2 text-center text-base leading-tight text-white"
        @click="logChatHandler('markdown')"
      >
        {{ i18n.t("content.downloadAsMarkdown") }}
      </button>
    </div>
  </main>
</template>
