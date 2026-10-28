import * as React from "react"
import * as DialogPrimitive from "@rn-primitives/dialog"
import { cn } from "cn"
import { X } from "lucide-react-native"
import { Platform, View, type ViewProps } from "react-native"
import { FadeIn, FadeOut, ReduceMotion } from "react-native-reanimated"
import { FullWindowOverlay as RNFullWindowOverlay } from "react-native-screens"

import { Button } from "@/components/ui/button"
import { Icon } from "@/components/ui/icon"
import { NativeOnlyAnimatedView } from "@/components/ui/native-only-animated-view"
import { useEngineCheck } from "@/lib/vinui-engine"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close

// iOS: render above native modals/screens.
const FullWindowOverlay = Platform.OS === "ios" ? RNFullWindowOverlay : React.Fragment

function DialogOverlay({
  className,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogPrimitive.Overlay>, "asChild"> & {
  children?: React.ReactNode
}) {
  return (
    <FullWindowOverlay>
      <DialogPrimitive.Overlay
        className={cn("absolute inset-0 z-50 items-center justify-center bg-black/50 p-4", className)}
        {...props}
        asChild
      >
        <NativeOnlyAnimatedView
          as="Pressable"
          entering={FadeIn.duration(200).reduceMotion(ReduceMotion.System)}
          exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
        >
          <NativeOnlyAnimatedView
            className="w-full items-center"
            entering={FadeIn.delay(50).reduceMotion(ReduceMotion.System)}
            exiting={FadeOut.duration(150).reduceMotion(ReduceMotion.System)}
          >
            <>{children}</>
          </NativeOnlyAnimatedView>
        </NativeOnlyAnimatedView>
      </DialogPrimitive.Overlay>
    </FullWindowOverlay>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  portalHost,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
  portalHost?: string
}) {
  useEngineCheck()
  return (
    <DialogPortal hostName={portalHost}>
      <DialogOverlay>
        {/* dialog-panel is the shared look; native centers it with overlay padding + max width. */}
        <DialogPrimitive.Content className={cn("dialog-panel w-full max-w-lg", className)} {...props}>
          <>{children}</>
          {showCloseButton && (
            <DialogPrimitive.Close className="dialog-close" aria-label="Close" hitSlop={12}>
              <Icon as={X} className="text-muted-foreground size-4" />
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogOverlay>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: ViewProps) {
  return <View className={cn("dialog-header", className)} {...props} />
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: ViewProps & {
  showCloseButton?: boolean
}) {
  return (
    <View className={cn("dialog-footer", className)} {...props}>
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="outline">Close</Button>
        </DialogPrimitive.Close>
      )}
    </View>
  )
}

// Native Text doesn't inherit the panel's color, so the title sets it explicitly.
function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn("dialog-title text-foreground", className)} {...props} />
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn("dialog-description", className)} {...props} />
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
