<script setup lang="ts">
import type { DialogTitleProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { DialogTitle } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"

const props = defineProps<DialogTitleProps & { class?: HTMLAttributes["class"] }>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
</script>

<template>
  <DialogTitle
    data-slot="dialog-title"
    v-bind="delegated"
    :class="cn('dialog-title', props.class)"
  >
    <slot />
  </DialogTitle>
</template>
