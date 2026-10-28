<script setup lang="ts">
import type { DialogDescriptionProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { DialogDescription } from "reka-ui"
import { computed } from "vue"
import { cn } from "@/lib/utils"

const props = defineProps<DialogDescriptionProps & { class?: HTMLAttributes["class"] }>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
</script>

<template>
  <DialogDescription
    data-slot="dialog-description"
    v-bind="delegated"
    :class="cn('dialog-description', props.class)"
  >
    <slot />
  </DialogDescription>
</template>
