<script setup lang="ts">
import type { DialogOverlayProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { DialogOverlay } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"

const props = defineProps<DialogOverlayProps & { class?: HTMLAttributes["class"] }>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
</script>

<template>
  <DialogOverlay
    data-slot="dialog-overlay"
    v-bind="delegated"
    :class="cn('dialog-overlay', props.class)"
  />
</template>
