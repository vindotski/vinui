import "./global.css"

import Plus from "lucide-react-native/icons/plus"
import * as React from "react"
import { Platform, Pressable, View, type LayoutChangeEvent } from "react-native"
import { Uniwind } from "uniwind"

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
import { Text } from "@/components/ui/text"
import { ThemeRoot } from "@/components/ui/theme-root"

/**
 * The docs' "React Native (web)" previews: on web, `?demo=<name>` renders one demo, the
 * same as the docs' React demo, in an iframe on the docs.
 * - Theme: `?theme=light|dark` for the first paint, then `vinui:theme` messages from the docs.
 * - Size: posts `vinui:preview-size` with the content height, so the docs size the frame.
 * Messages are accepted from and sent to the same origin only.
 */
const demos = {
  button: ButtonDemo,
  dialog: DialogDemo,
}
type Demo = keyof typeof demos

const variants = ["default", "secondary", "outline", "ghost", "destructive", "link"] as const
const sizes = ["xs", "sm", "default", "lg"] as const
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const

function ButtonDemo() {
  return (
    <View className="gap-4">
      <View className="flex-row flex-wrap gap-2">
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        {sizes.map((size) => (
          <Button key={size} variant="outline" size={size}>
            {size}
          </Button>
        ))}
      </View>
      <View className="flex-row flex-wrap items-center gap-2">
        {iconSizes.map((size) => (
          <Button key={size} variant="outline" size={size} aria-label={`Add (${size})`}>
            <Icon as={Plus} />
          </Button>
        ))}
      </View>
      <View className="flex-row flex-wrap gap-2">
        <Button disabled>disabled</Button>
        <Button asChild variant="ghost">
          <Pressable>
            <Text>link</Text>
          </Pressable>
        </Button>
      </View>
    </View>
  )
}

function DialogDemo() {
  return (
    <View className="flex-row flex-wrap gap-2">
      <Dialog>
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
    </View>
  )
}

type Theme = "light" | "dark"
const isTheme = (value: unknown): value is Theme => value === "light" || value === "dark"

/** The requested demo, on web only (devices always show the full playground). */
function docsDemo(): Demo | null {
  if (Platform.OS !== "web") return null
  const params = new URLSearchParams(window.location.search)
  const demo = params.get("demo")
  if (!demo || !(demo in demos)) return null
  // Before the first render, so the frame never flashes the other theme.
  const theme = params.get("theme")
  if (isTheme(theme)) Uniwind.setTheme(theme)
  return demo as Demo
}

/** The root component for `?demo=<name>` on web, or null to render the playground. */
export function docsPreviewRoot(): React.ComponentType | null {
  const demo = docsDemo()
  return demo ? () => <DocsPreview demo={demo} /> : null
}

function DocsPreview({ demo }: { demo: Demo }) {
  const origin = window.location.origin
  React.useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== origin || event.data?.type !== "vinui:theme" || !isTheme(event.data.theme)) return
      Uniwind.setTheme(event.data.theme)
    }
    window.addEventListener("message", onMessage)
    // The docs may have changed theme while this frame loaded: ask for the current one.
    window.parent.postMessage({ type: "vinui:preview-ready" }, origin)
    return () => window.removeEventListener("message", onMessage)
  }, [origin])
  const onLayout = (event: LayoutChangeEvent) =>
    window.parent.postMessage({ type: "vinui:preview-size", height: Math.ceil(event.nativeEvent.layout.height) }, origin)
  const DemoComponent = demos[demo]
  return (
    <ThemeRoot statusBar={false}>
      <View className="p-6" onLayout={onLayout}>
        <DemoComponent />
      </View>
    </ThemeRoot>
  )
}
