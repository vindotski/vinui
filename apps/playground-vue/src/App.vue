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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ref } from "vue"

const size = ref("m")

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
    <Dialog>
      <DialogTrigger as-child>
        <Button variant="secondary">Footer close</Button>
      </DialogTrigger>
      <DialogContent :show-close-button="false">
        <DialogHeader>
          <DialogTitle>Saved</DialogTitle>
          <DialogDescription>Your changes were saved.</DialogDescription>
        </DialogHeader>
        <DialogFooter show-close-button />
      </DialogContent>
    </Dialog>
    <div class="flex flex-col gap-2">
      <Select>
        <SelectTrigger aria-label="Fruit" class="w-44">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <!-- item-aligned, as React's default; Vue's default is popper (the Size select). -->
        <SelectContent position="item-aligned">
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
            <SelectItem value="banana">Banana</SelectItem>
            <SelectItem value="blueberry">Blueberry</SelectItem>
            <SelectItem value="grapes" disabled>Grapes</SelectItem>
            <SelectItem value="pineapple">Pineapple</SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            <SelectItem value="carrot">Carrot</SelectItem>
            <SelectItem value="leek">Leek</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select v-model="size">
        <SelectTrigger aria-label="Size" size="sm" class="w-44">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="s">Small</SelectItem>
          <SelectItem value="m">Medium</SelectItem>
          <SelectItem value="l">Large</SelectItem>
        </SelectContent>
      </Select>
      <p data-testid="size-value">Size: {{ size }}</p>
    </div>
  </main>
</template>
