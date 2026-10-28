<script setup lang="ts">
import type { DialogContentEmits, DialogContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { DialogClose, DialogContent, DialogPortal, useForwardPropsEmits } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"
import DialogOverlay from "./DialogOverlay.vue"

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<
    DialogContentProps & { class?: HTMLAttributes["class"]; showCloseButton?: boolean }
  >(),
  { showCloseButton: true },
)
const emits = defineEmits<DialogContentEmits>()

const delegated = computed(() => {
  const { class: _, showCloseButton: __, ...rest } = props
  return rest
})

const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <DialogPortal>
    <DialogOverlay />
    <DialogContent
      data-slot="dialog-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn('dialog-content', props.class)"
    >
      <slot />
      <DialogClose v-if="showCloseButton" data-slot="dialog-close" class="dialog-close">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
        <span class="sr-only">Close</span>
      </DialogClose>
    </DialogContent>
  </DialogPortal>
</template>
