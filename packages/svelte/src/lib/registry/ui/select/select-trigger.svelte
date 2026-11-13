<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui"
  import { cn, type WithoutChild } from "$lib/utils.js"
  import { type SelectTriggerSize, selectTriggerSizes } from "./index.js"

  let {
    ref = $bindable(null),
    class: className,
    children,
    size = "default",
    ...restProps
  }: WithoutChild<SelectPrimitive.TriggerProps> & { size?: SelectTriggerSize } = $props()
</script>

<SelectPrimitive.Trigger
  bind:ref
  data-slot="select-trigger"
  data-size={size}
  class={cn("select-trigger", selectTriggerSizes[size], className)}
  {...restProps}
>
  {@render children?.()}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
</SelectPrimitive.Trigger>
