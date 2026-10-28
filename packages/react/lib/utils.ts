import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Merges base classes into a Base UI `className`, which may be a string or a
 * function of the component's state.
 */
export function cnState<State>(
  base: ClassValue,
  className: string | ((state: State) => string | undefined) | undefined,
) {
  return typeof className === "function"
    ? (state: State) => cn(base, className(state))
    : cn(base, className)
}
