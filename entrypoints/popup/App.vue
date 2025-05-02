<script lang="ts" setup>
import devlog from "@/utils/dev-log"
import { ref } from "vue"
import Toggle from "@/components/toggle.vue"

const includeUserToggle = ref(false)
const includeRoleNamesToggle = ref(false)
const errorMessage = ref("")

const userPromptsId = "user-prompts"
const roleNamesId = "role-names"

function logChatHandler() {
  errorMessage.value = ""
  browser.tabs.query({}, function (tabs) {
    const targetTab = tabs.find(function (tab) {
      return tab.url && tab.url.startsWith("https://chatgpt.com/c/")
    })
    if (!targetTab) {
      errorMessage.value = "You must have a chatgpt.com/c/* tab open to export the conversation."
      return
    }
    devlog("logChatHandler called")
    browser.runtime
      .sendMessage({
        action: "logContent",
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
    <h1 class="text-2xl font-bold">ChatGPT Export Conversation</h1>
    <div v-if="errorMessage" class="mb-2 rounded bg-red-100 px-4 py-2 text-base font-medium text-red-700">
      {{ errorMessage }}
    </div>
    <div class="flex items-center gap-2">
      <Toggle :id="userPromptsId" :set-checked="toggleIncludeUser" />
      <label :for="userPromptsId" class="text-lg text-blue-900 select-none">Include User Prompts</label>
    </div>
    <div class="flex items-center gap-2">
      <Toggle :id="roleNamesId" :set-checked="toggleIncludeRoleNames" />
      <label :for="roleNamesId" class="text-lg text-blue-900 select-none">Include Role Names</label>
    </div>
    <button class="cursor-pointer rounded bg-black px-2 py-2 text-center text-lg text-white" @click="logChatHandler">
      Download As TXT
    </button>
  </main>
</template>
