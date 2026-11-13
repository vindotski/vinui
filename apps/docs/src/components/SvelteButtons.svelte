<script lang="ts">
  import { Button, buttonVariants } from "@vinui/svelte/ui/button"

  const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
  const sizes = ["xs", "sm", "default", "lg"] as const
  const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-wrap gap-2">
    {#each variants as variant (variant)}
      <Button {variant}>{variant}</Button>
    {/each}
  </div>
  <div class="flex flex-wrap items-center gap-2">
    {#each sizes as size (size)}
      <Button variant="outline" {size}>{size}</Button>
    {/each}
  </div>
  <div class="flex flex-wrap items-center gap-2">
    {#each iconSizes as size (size)}
      <Button variant="outline" {size} aria-label={`Add (${size})`}>+</Button>
    {/each}
  </div>
  <div class="flex flex-wrap gap-2">
    <Button disabled>disabled</Button>
    <a href="#button-variants" class={buttonVariants({ variant: "ghost" })}>link</a>
  </div>
</div>
