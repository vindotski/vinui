<script setup lang="ts">
import type { SelectItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { SelectItem, SelectItemIndicator, SelectItemText, useForwardProps } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"

const props = defineProps<SelectItemProps & { class?: HTMLAttributes["class"] }>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})

const forwarded = useForwardProps(delegated)
</script>

<template>
  <SelectItem data-slot="select-item" v-bind="forwarded" :class="cn('select-item', props.class)">
    <span data-slot="select-item-indicator" class="select-item-indicator">
      <SelectItemIndicator>
        <slot name="indicator-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </slot>
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
