<script lang="ts">
  import { Button } from "@vinui/svelte/ui/button"
  import * as Dialog from "@vinui/svelte/ui/dialog"
</script>

<div class="flex flex-wrap gap-2">
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
</div>
