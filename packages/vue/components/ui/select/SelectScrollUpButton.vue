<script setup lang="ts">
import type { SelectScrollUpButtonProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { SelectScrollUpButton, useForwardProps } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"

const props = defineProps<SelectScrollUpButtonProps & { class?: HTMLAttributes["class"] }>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})

const forwarded = useForwardProps(delegated)
</script>

<template>
  <SelectScrollUpButton
    data-slot="select-scroll-up-button"
    v-bind="forwarded"
    :class="cn('select-scroll-button', props.class)"
  >
    <slot>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m18 15-6-6-6 6" />
      </svg>
    </slot>
  </SelectScrollUpButton>
</template>
