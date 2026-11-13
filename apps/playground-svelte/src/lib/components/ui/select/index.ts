import Root from "./select.svelte"
import Content from "./select-content.svelte"
import Group from "./select-group.svelte"
import GroupHeading from "./select-group-heading.svelte"
import Item from "./select-item.svelte"
import Label from "./select-label.svelte"
import Portal from "./select-portal.svelte"
import ScrollDownButton from "./select-scroll-down-button.svelte"
import ScrollUpButton from "./select-scroll-up-button.svelte"
import Separator from "./select-separator.svelte"
import Trigger from "./select-trigger.svelte"
import Value from "./select-value.svelte"

export const selectTriggerSizes = {
  default: "",
  sm: "select-trigger-sm",
} as const

export type SelectTriggerSize = keyof typeof selectTriggerSizes

export {
  Root,
  Content,
  Group,
  GroupHeading,
  Item,
  Label,
  Portal,
  ScrollDownButton,
  ScrollUpButton,
  Separator,
  Trigger,
  Value,
  //
  Root as Select,
  Content as SelectContent,
  Group as SelectGroup,
  GroupHeading as SelectGroupHeading,
  Item as SelectItem,
  Label as SelectLabel,
  Portal as SelectPortal,
  ScrollDownButton as SelectScrollDownButton,
  ScrollUpButton as SelectScrollUpButton,
  Separator as SelectSeparator,
  Trigger as SelectTrigger,
  Value as SelectValue,
}
