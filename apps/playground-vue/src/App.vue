<script setup lang="ts">
import { Button } from "@/components/ui/button"

function toggleDark() {
  document.documentElement.classList.toggle("dark")
}
</script>

<template>
  <main class="bg-background text-foreground flex min-h-svh items-center justify-center gap-2">
    <Button>Primary</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="destructive" size="sm">Delete</Button>
    <Button variant="ghost" @click="toggleDark">Toggle dark</Button>
  </main>
</template>
