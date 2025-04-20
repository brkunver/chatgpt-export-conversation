<script lang="ts" setup>
import { ref } from "vue"
import Toggle from "@/components/toggle.vue"

const checked = ref(false)
const userPromptsId = "user-prompts"

function logChatHandler() {
  browser.runtime.sendMessage({ action: "logContent", includeUser: checked.value })
}

function toggleHandler(check: boolean) {
  checked.value = check
}
</script>

<template>
  <main class="flex min-w-[300px] flex-col justify-center gap-4 p-4 text-center">
    <h1 class="text-2xl font-bold">ChatGPT Export Conversation</h1>
    <div class="flex items-center gap-2">
      <Toggle :id="userPromptsId" :set-checked="toggleHandler" />
      <label :for="userPromptsId" class="text-lg text-blue-900 select-none">Include User Prompts</label>
    </div>
    <button class="cursor-pointer rounded bg-black px-2 py-2 text-center text-lg text-white" @click="logChatHandler">
      Download As TXT
    </button>
  </main>
</template>
