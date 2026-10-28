<script setup lang="ts">
import { Button, buttonVariants } from "@vinui/vue/ui/button"

const variants = ["primary", "secondary", "outline", "ghost", "destructive"] as const
const sizes = ["sm", "md", "lg"] as const
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap gap-2">
      <Button v-for="variant in variants" :key="variant" :variant="variant">
        {{ variant }}
      </Button>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <Button v-for="size in sizes" :key="size" variant="outline" :size="size">
        {{ size }}
      </Button>
      <Button variant="outline" size="icon" aria-label="Add">+</Button>
    </div>
    <div class="flex flex-wrap gap-2">
      <Button disabled>disabled</Button>
      <a href="#" :class="buttonVariants({ variant: 'ghost' })">link</a>
    </div>
  </div>
</template>
