<script setup lang="ts">
import type { SelectContentEmits, SelectContentProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { SelectContent, SelectPortal, SelectViewport, useForwardPropsEmits } from "reka-ui"
import { computed } from "vue"
import { cn } from "cn"
import SelectScrollDownButton from "./SelectScrollDownButton.vue"
import SelectScrollUpButton from "./SelectScrollUpButton.vue"

defineOptions({
  inheritAttrs: false,
})

// shadcn-vue's default: the list opens below the trigger.
const props = withDefaults(
  defineProps<SelectContentProps & { class?: HTMLAttributes["class"] }>(),
  { position: "popper" },
)
const emits = defineEmits<SelectContentEmits>()

const delegated = computed(() => {
  const { class: _, ...rest } = props
  return rest
})

const forwarded = useForwardPropsEmits(delegated, emits)
</script>

<template>
  <SelectPortal>
    <SelectContent
      data-slot="select-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="cn('select-content', props.class)"
    >
      <SelectScrollUpButton />
      <SelectViewport :data-position="position" class="select-viewport">
        <slot />
      </SelectViewport>
      <SelectScrollDownButton />
    </SelectContent>
  </SelectPortal>
</template>
