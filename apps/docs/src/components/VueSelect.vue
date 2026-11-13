<script setup lang="ts">
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@vinui/vue/ui/select"
import { ref } from "vue"

const size = ref("m")
</script>

<template>
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
    <p class="text-muted-foreground text-sm">Size: {{ size }}</p>
  </div>
</template>
