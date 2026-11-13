import * as React from "react"
import { Pressable } from "react-native"
import Animated from "react-native-reanimated"

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type Props =
  | (React.ComponentProps<typeof Animated.View> & { as?: "View" })
  | (React.ComponentProps<typeof AnimatedPressable> & { as: "Pressable" })

/** Reanimated view for entering/exiting animations (on react-native-web too, via Reanimated's web support). */
function NativeOnlyAnimatedView({ as, ...props }: Props) {
  if (as === "Pressable") return <AnimatedPressable {...(props as React.ComponentProps<typeof AnimatedPressable>)} />
  return <Animated.View {...(props as React.ComponentProps<typeof Animated.View>)} />
}

export { NativeOnlyAnimatedView }
