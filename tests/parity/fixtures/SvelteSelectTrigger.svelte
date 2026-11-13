<!-- SSR fixture: a Svelte SelectTrigger inside its Root, for the class parity test. -->
<script lang="ts">
  import * as Select from "@vinui/svelte/ui/select"
  import type { SelectTriggerSize } from "@vinui/svelte/ui/select"

  let { size, class: className }: { size?: SelectTriggerSize; class?: string } = $props()
</script>

<Select.Root type="single">
  <Select.Trigger {size} class={className}>
    <Select.Value placeholder="Pick" />
  </Select.Trigger>
</Select.Root>
