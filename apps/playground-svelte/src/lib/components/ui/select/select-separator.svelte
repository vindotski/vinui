<script lang="ts">
  import { Separator as SeparatorPrimitive } from "bits-ui"
  import { cn } from "#lib/utils.js"

  let { ref = $bindable(null), class: className, ...restProps }: SeparatorPrimitive.RootProps = $props()
</script>

<SeparatorPrimitive.Root
  bind:ref
  data-slot="select-separator"
  class={cn("select-separator", className)}
  {...restProps}
/>
