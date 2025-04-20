<script lang="ts" setup>
const props = defineProps<{
  id: string
  setChecked: (checked: boolean) => void
}>()

function onChange(e: Event) {
  const target = e.target as HTMLInputElement
  props.setChecked(target.checked)
}
</script>

<template>
  <label
    :for="props.id"
    class="relative block h-8 w-14 cursor-pointer rounded-full bg-gray-300 transition-colors [-webkit-tap-highlight-color:_transparent] has-checked:bg-green-500"
  >
    <input type="checkbox" :id="props.id" class="peer sr-only" @change="onChange" />
    <span
      class="absolute inset-y-0 start-0 m-1 size-6 rounded-full bg-white transition-[inset-inline-start] peer-checked:start-6"
    ></span>
  </label>
</template>
