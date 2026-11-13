<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui"
  import type { ComponentProps } from "svelte"
  import { cn, type WithoutChild, type WithoutChildrenOrChild } from "#lib/utils.js"
  import SelectPortal from "./select-portal.svelte"
  import SelectScrollDownButton from "./select-scroll-down-button.svelte"
  import SelectScrollUpButton from "./select-scroll-up-button.svelte"

  // sideOffset 0, as on Radix and Reka: the 4px gap comes from select-content's translate.
  let {
    ref = $bindable(null),
    class: className,
    sideOffset = 0,
    portalProps,
    children,
    preventScroll = true,
    ...restProps
  }: WithoutChild<SelectPrimitive.ContentProps> & {
    portalProps?: WithoutChildrenOrChild<ComponentProps<typeof SelectPortal>>
  } = $props()
</script>

<SelectPortal {...portalProps}>
  <SelectPrimitive.Content
    bind:ref
    {sideOffset}
    {preventScroll}
    data-slot="select-content"
    class={cn("select-content", className)}
    {...restProps}
  >
    <SelectScrollUpButton />
    <!-- Bits UI positions the list as a popper only. -->
    <SelectPrimitive.Viewport data-position="popper" class="select-viewport">
      {@render children?.()}
    </SelectPrimitive.Viewport>
    <SelectScrollDownButton />
  </SelectPrimitive.Content>
</SelectPortal>
