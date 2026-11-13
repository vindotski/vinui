<script lang="ts">
  import { Select as SelectPrimitive } from "bits-ui"
  import { cn, type WithoutChild } from "$lib/utils.js"

  let {
    ref = $bindable(null),
    class: className,
    value,
    label,
    disabled,
    children: childrenProp,
    ...restProps
  }: WithoutChild<SelectPrimitive.ItemProps> = $props()
</script>

<!-- aria-disabled: Bits UI marks disabled options with data-disabled only (vinui addition). -->
<SelectPrimitive.Item
  bind:ref
  {value}
  {label}
  {disabled}
  aria-disabled={disabled ? "true" : undefined}
  data-slot="select-item"
  class={cn("select-item", className)}
  {...restProps}
>
  {#snippet children({ selected, highlighted })}
    <span data-slot="select-item-indicator" class="select-item-indicator">
      {#if selected}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      {/if}
    </span>
    <span data-slot="select-item-text">
      {#if childrenProp}
        {@render childrenProp({ selected, highlighted })}
      {:else}
        {label || value}
      {/if}
    </span>
  {/snippet}
</SelectPrimitive.Item>
