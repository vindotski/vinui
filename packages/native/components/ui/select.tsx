import * as React from "react"
import * as SelectPrimitive from "@rn-primitives/select"
import { cn } from "cn"
// Per-icon imports: Metro doesn't tree-shake the lucide-react-native root export.
import Check from "lucide-react-native/icons/check"
import ChevronDown from "lucide-react-native/icons/chevron-down"
import ChevronUp from "lucide-react-native/icons/chevron-up"
import { Platform, StyleSheet, View } from "react-native"
import { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated"
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens"

import { Icon } from "@/components/ui/icon"
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view"
import { TextClassContext } from "@/components/ui/text"
import { useEngineCheck } from "@/lib/vinui-engine"

/** `{ value, label }`: rn-primitives' value type (the web ports use the value string). */
type Option = SelectPrimitive.Option

const triggerSizes = {
  default: "",
  sm: "select-trigger-sm",
} as const

type SelectTriggerSize = keyof typeof triggerSizes

const Select = SelectPrimitive.Root
const SelectGroup = SelectPrimitive.Group

// React Native Text doesn't inherit colour or size, so the value text sets them.
function SelectValue({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Value>) {
  const { value } = SelectPrimitive.useRootContext()
  return (
    <SelectPrimitive.Value
      className={cn("text-sm", value ? "text-foreground" : "text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * On web, rn-primitives renders Radix's trigger as a Pressable with a hardcoded
 * role="button" (and drops a `role` prop), hiding that it opens a listbox. Restore the
 * combobox role Radix sets on the web ports. iOS and Android already report combobox.
 */
function comboboxRoleOnWeb(node: unknown) {
  if (Platform.OS === "web" && node instanceof Element) node.setAttribute("role", "combobox")
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
    }
  }
}

function SelectTrigger({
  className,
  children,
  size = "default",
  ref,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  children?: React.ReactNode
  size?: SelectTriggerSize
}) {
  useEngineCheck()
  return (
    <SelectPrimitive.Trigger
      ref={mergeRefs(ref, comboboxRoleOnWeb)}
      className={cn(
        // Fixed height, centred content: React Native would clip the text inside the
        // vertical padding (32px small trigger, 20px text), where the web lets it overflow evenly.
        "select-trigger flex-row py-0",
        triggerSizes[size],
        // React Native has no :disabled pseudo-class.
        props.disabled && "opacity-50",
        className,
      )}
      {...props}
    >
      <>{children}</>
      <Icon as={ChevronDown} aria-hidden className="text-muted-foreground size-4" />
    </SelectPrimitive.Trigger>
  )
}

// iOS: render above native modals/screens.
const FullWindowOverlay = Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment

function SelectContent({
  className,
  children,
  position = "popper",
  portalHost,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content> & {
  className?: string
  portalHost?: string
}) {
  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <SelectPrimitive.Overlay
          style={Platform.select({ native: StyleSheet.absoluteFill })}
          asChild={Platform.OS !== "web"}
        >
          <NativeOnlyAnimatedView
            className="z-50"
            entering={FadeIn.reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.reduceMotion(ReduceMotion.System)}
            as="Pressable"
          >
            <TextClassContext.Provider value="text-popover-foreground">
              {/* select-panel is the shared look; on web (Radix underneath) select-content
                  adds the positioning and zoom, as on the web ports. */}
              <SelectPrimitive.Content
                className={cn(Platform.select({ web: "select-content", default: "select-panel p-1" }), className)}
                position={position}
                {...props}
              >
                <SelectScrollUpButton />
                <SelectPrimitive.Viewport
                  className={cn(
                    "select-viewport",
                    position === "popper" &&
                      Platform.select({
                        web: "h-(--radix-select-trigger-height) w-full min-w-(--radix-select-trigger-width)",
                      }),
                  )}
                >
                  {children}
                </SelectPrimitive.Viewport>
                <SelectScrollDownButton />
              </SelectPrimitive.Content>
            </TextClassContext.Provider>
          </NativeOnlyAnimatedView>
        </SelectPrimitive.Overlay>
      </FullWindowOverlay>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn("select-label", className)} {...props} />
}

/**
 * `label` is the option's text, as in RNR. A plain string child works too, as on the web
 * ports (`<SelectItem value="apple">Apple</SelectItem>`).
 */
function SelectItem({
  className,
  label,
  children,
  ...props
}: Omit<React.ComponentProps<typeof SelectPrimitive.Item>, "label" | "children"> & {
  label?: string
  children?: string
}) {
  return (
    <SelectPrimitive.Item
      className={cn("select-item group flex-row active:bg-accent", props.disabled && "opacity-50", className)}
      label={label ?? children ?? props.value}
      {...props}
    >
      <View className="select-item-indicator">
        <SelectPrimitive.ItemIndicator>
          <Icon as={Check} className="text-muted-foreground size-4" />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText className="text-foreground group-active:text-accent-foreground text-sm select-none" />
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return <SelectPrimitive.Separator className={cn("select-separator", className)} {...props} />
}

/** Web only (the list scrolls natively elsewhere); renders nothing on iOS and Android. */
function SelectScrollUpButton({ className, ...props }: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  if (Platform.OS !== "web") return null
  return (
    <SelectPrimitive.ScrollUpButton className={cn("select-scroll-button", className)} {...props}>
      <Icon as={ChevronUp} className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  )
}

/** Web only (the list scrolls natively elsewhere); renders nothing on iOS and Android. */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  if (Platform.OS !== "web") return null
  return (
    <SelectPrimitive.ScrollDownButton className={cn("select-scroll-button", className)} {...props}>
      <Icon as={ChevronDown} className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
export type { Option, SelectTriggerSize }
