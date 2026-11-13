<script setup lang="ts">
import type { SelectLabelProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { SelectLabel } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"

const props = defineProps<SelectLabelProps & { class?: HTMLAttributes["class"] }>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
</script>

<template>
  <SelectLabel data-slot="select-label" v-bind="delegated" :class="cn('select-label', props.class)">
    <slot />
  </SelectLabel>
</template>
