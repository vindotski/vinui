import "./global.css"

import Plus from "lucide-react-native/icons/plus"
import * as React from "react"
import { Linking, Pressable, ScrollView, View } from "react-native"
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context"
import { Uniwind, useUniwind } from "uniwind"

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
import { Icon } from "@/components/ui/icon"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  type Option,
} from "@/components/ui/select"
import { Text } from "@/components/ui/text"
import { ThemeRoot } from "@/components/ui/theme-root"

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const sizes = ["xs", "sm", "default", "lg"] as const
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const
const themes = ["light", "dark", "system"] as const

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-3">
      <Text className="text-muted-foreground text-sm font-medium">{title}</Text>
      <View className="flex-row flex-wrap items-center gap-2">{children}</View>
    </View>
  )
}

/** `?dialog=open` in the launch URL opens the first Dialog (screenshots, docs previews). */
function useDialogFromUrl() {
  const [open, setOpen] = React.useState(false)
  React.useEffect(() => {
    const apply = (url: string | null | undefined) => {
      if (url && /[?&]dialog=open\b/.test(url)) setOpen(true)
    }
    void Linking.getInitialURL().then(apply)
    const subscription = Linking.addEventListener("url", ({ url }) => apply(url))
    return () => subscription.remove()
  }, [])
  return [open, setOpen] as const
}

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
const sizeOptions = [
  { value: "s", label: "Small" },
  { value: "m", label: "Medium" },
  { value: "l", label: "Large" },
]

function SelectDemo() {
  const [size, setSize] = React.useState<Option>(sizeOptions[1])
  return (
    <View className="gap-2">
      <Select>
        <SelectTrigger aria-label="Fruit" className="w-44">
          <SelectValue placeholder="Pick a fruit" />
        </SelectTrigger>
        <SelectContent className="w-44">
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            {fruits.map((f) => (
              <SelectItem key={f.value} value={f.value} label={f.label} disabled={f.disabled} />
            ))}
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>Vegetables</SelectLabel>
            {vegetables.map((v) => (
              <SelectItem key={v.value} value={v.value} label={v.label} />
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select value={size} onValueChange={(option) => option && setSize(option)}>
        <SelectTrigger aria-label="Size" size="sm" className="w-44">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
        <SelectContent className="w-44">
          {sizeOptions.map((o) => (
            <SelectItem key={o.value} value={o.value} label={o.label} />
          ))}
        </SelectContent>
      </Select>
      <Text testID="size-value">Size: {size?.value}</Text>
    </View>
  )
}

export default function App() {
  const { theme } = useUniwind()
  const [dialogOpen, setDialogOpen] = useDialogFromUrl()
  return (
    <SafeAreaProvider>
      {/* safe-area-context's SafeAreaView isn't a core component, so Uniwind ignores its
          className: the background comes from ThemeRoot. */}
      <ThemeRoot>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerClassName="gap-8 p-6">
            <View className="gap-1">
              <Text className="text-2xl font-semibold">vinui · React Native</Text>
              <Text className="text-muted-foreground text-sm">Theme: {theme}</Text>
            </View>

            <Section title="Theme">
              {themes.map((t) => (
                <Button key={t} size="sm" variant={theme === t ? "default" : "outline"} onPress={() => Uniwind.setTheme(t)}>
                  {t}
                </Button>
              ))}
            </Section>

            {/* Near the top, so the lists have room to open downwards. */}
            <Section title="Select">
              <SelectDemo />
            </Section>

            <Section title="Variants">
              {variants.map((v) => (
                <Button key={v} variant={v}>
                  {v}
                </Button>
              ))}
            </Section>

            <Section title="Sizes">
              {sizes.map((s) => (
                <Button key={s} variant="outline" size={s}>
                  {s}
                </Button>
              ))}
            </Section>

            <Section title="Icon sizes">
              {iconSizes.map((s) => (
                <Button key={s} variant="outline" size={s} aria-label={`Add (${s})`}>
                  <Icon as={Plus} />
                </Button>
              ))}
            </Section>

            <Section title="States">
              <Button disabled>disabled</Button>
              {/* The docs' styled link (buttonVariants on an <a>). Native uses asChild, which
                  needs a box child: a bare Text can't centre its own label. */}
              <Button asChild variant="ghost">
                <Pressable onPress={() => Linking.openURL("https://vinui.dev")}>
                  <Text>link</Text>
                </Pressable>
              </Button>
            </Section>

            <Section title="Dialog">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">Open dialog</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete project?</DialogTitle>
                    <DialogDescription>This permanently removes the project and all of its data.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button variant="destructive">Delete</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary">Footer close</Button>
                </DialogTrigger>
                <DialogContent showCloseButton={false}>
                  <DialogHeader>
                    <DialogTitle>Saved</DialogTitle>
                    <DialogDescription>Your changes were saved.</DialogDescription>
                  </DialogHeader>
                  <DialogFooter showCloseButton />
                </DialogContent>
              </Dialog>
            </Section>
          </ScrollView>
        </SafeAreaView>
      </ThemeRoot>
    </SafeAreaProvider>
  )
}
