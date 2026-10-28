<script setup lang="ts">
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

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
    <Dialog>
      <DialogTrigger as-child>
        <Button variant="outline">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete project?</DialogTitle>
          <DialogDescription>
            This permanently removes the project and all of its data.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose as-child>
            <Button variant="destructive">Delete</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </main>
</template>
