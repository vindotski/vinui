<script lang="ts">
  import { Button } from "#lib/components/ui/button/index.js"
  import * as Dialog from "#lib/components/ui/dialog/index.js"
  import * as Select from "#lib/components/ui/select/index.js"

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

  function toggleDark() {
    document.documentElement.classList.toggle("dark")
  }
</script>

<main class="bg-background text-foreground flex min-h-svh items-center justify-center gap-2">
  <Button>Primary</Button>
  <Button variant="outline">Outline</Button>
  <Button variant="destructive" size="sm">Delete</Button>
  <Button variant="ghost" onclick={toggleDark}>Toggle dark</Button>
  <Button href="#docs" variant="link">Docs link</Button>
  <Dialog.Root>
    <Dialog.Trigger>
      {#snippet child({ props })}
        <Button variant="outline" {...props}>Open dialog</Button>
      {/snippet}
    </Dialog.Trigger>
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Delete project?</Dialog.Title>
        <Dialog.Description>This permanently removes the project and all of its data.</Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button variant="outline" {...props}>Cancel</Button>
          {/snippet}
        </Dialog.Close>
        <Dialog.Close>
          {#snippet child({ props })}
            <Button variant="destructive" {...props}>Delete</Button>
          {/snippet}
        </Dialog.Close>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
  <Dialog.Root>
    <Dialog.Trigger>
      {#snippet child({ props })}
        <Button variant="secondary" {...props}>Footer close</Button>
      {/snippet}
    </Dialog.Trigger>
    <Dialog.Content showCloseButton={false}>
      <Dialog.Header>
        <Dialog.Title>Saved</Dialog.Title>
        <Dialog.Description>Your changes were saved.</Dialog.Description>
      </Dialog.Header>
      <Dialog.Footer showCloseButton />
    </Dialog.Content>
  </Dialog.Root>
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
    <p data-testid="size-value">Size: {size}</p>
  </div>
</main>
