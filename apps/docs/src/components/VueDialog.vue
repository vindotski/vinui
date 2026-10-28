<script setup lang="ts">
import { Button } from "@vinui/vue/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@vinui/vue/ui/dialog"
</script>

<template>
  <div class="flex flex-wrap gap-2">
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
  </div>
</template>
