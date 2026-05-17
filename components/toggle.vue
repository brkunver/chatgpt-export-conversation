<script lang="ts" setup>
import devlog from "@/utils/dev-log"
const props = defineProps<{
  id: string
  setChecked: (checked: boolean) => void
}>()

function onChange(e: Event) {
  devlog("toggle.vue => onChange called")
  const target = e.target as HTMLInputElement
  devlog("toggle.vue => target.checked : ", target.checked)
  props.setChecked(target.checked)
}
</script>

<template>
  <label
    :for="props.id"
    class="relative block h-8 w-14 cursor-pointer rounded-full border border-white/10 bg-slate-700/90 shadow-inner transition-colors duration-200 [-webkit-tap-highlight-color:_transparent] has-checked:bg-emerald-500"
  >
    <input type="checkbox" :id="props.id" class="peer sr-only" @change="onChange" />
    <span
      class="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white shadow-[0_6px_16px_rgba(15,23,42,0.35)] ring-1 ring-black/5 transition-[inset-inline-start,transform] duration-200 peer-checked:start-6"
    ></span>
  </label>
</template>
