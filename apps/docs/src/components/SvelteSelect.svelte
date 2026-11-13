<script lang="ts">
  import * as Select from "@vinui/svelte/ui/select"

  const fruits = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "blueberry", label: "Blueberry" },
    { value: "grapes", label: "Grapes", disabled: true },
    { value: "pineapple", label: "Pineapple" },
  ]
  const vegetables = [
    { value: "carrot", label: "Carrot" },
    { value: "leek", label: "Leek" },
  ]
  const sizes = [
    { value: "s", label: "Small" },
    { value: "m", label: "Medium" },
    { value: "l", label: "Large" },
  ]
  let fruit = $state("")
  let size = $state("m")
</script>

<div class="flex flex-col gap-2">
  <Select.Root type="single" items={[...fruits, ...vegetables]} bind:value={fruit}>
    <Select.Trigger aria-label="Fruit" class="w-44">
      <Select.Value placeholder="Pick a fruit" />
    </Select.Trigger>
    <Select.Content>
      <Select.Group>
        <Select.Label>Fruits</Select.Label>
        {#each fruits as item (item.value)}
          <Select.Item value={item.value} label={item.label} disabled={item.disabled}>{item.label}</Select.Item>
        {/each}
      </Select.Group>
      <Select.Separator />
      <Select.Group>
        <Select.Label>Vegetables</Select.Label>
        {#each vegetables as item (item.value)}
          <Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
        {/each}
      </Select.Group>
    </Select.Content>
  </Select.Root>
  <Select.Root type="single" items={sizes} bind:value={size}>
    <Select.Trigger aria-label="Size" size="sm" class="w-44">
      <Select.Value />
    </Select.Trigger>
    <Select.Content>
      {#each sizes as item (item.value)}
        <Select.Item value={item.value} label={item.label}>{item.label}</Select.Item>
      {/each}
    </Select.Content>
  </Select.Root>
  <p class="text-muted-foreground text-sm">Size: {size}</p>
</div>
