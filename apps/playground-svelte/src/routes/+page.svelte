<script lang="ts">
  import { Button } from "#lib/components/ui/button/index.js"
  import * as Dialog from "#lib/components/ui/dialog/index.js"

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
</main>
