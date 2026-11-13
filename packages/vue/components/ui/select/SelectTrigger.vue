<script setup lang="ts">
import type { SelectTriggerProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { SelectIcon, SelectTrigger, useForwardProps } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"
import { type SelectTriggerSize, selectTriggerSizes } from "."

const props = withDefaults(
  defineProps<SelectTriggerProps & { class?: HTMLAttributes["class"]; size?: SelectTriggerSize }>(),
  { size: "default" },
)

const delegated = computed(() => {
  const { class: _, size: __, ...rest } = props
  return rest
})

const forwarded = useForwardProps(delegated)
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size"
    v-bind="forwarded"
    :class="cn('select-trigger', selectTriggerSizes[size], props.class)"
  >
    <slot />
    <SelectIcon as-child>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m6 9 6 6 6-6" />
      </svg>
    </SelectIcon>
  </SelectTrigger>
</template>
