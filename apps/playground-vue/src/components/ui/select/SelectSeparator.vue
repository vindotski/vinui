<script setup lang="ts">
import type { SelectSeparatorProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { SelectSeparator } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"

const props = defineProps<SelectSeparatorProps & { class?: HTMLAttributes["class"] }>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
</script>

<template>
  <SelectSeparator
    data-slot="select-separator"
    v-bind="delegated"
    :class="cn('select-separator', props.class)"
  />
</template>
