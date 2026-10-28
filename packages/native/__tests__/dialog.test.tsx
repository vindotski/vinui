import { PortalHost } from "@rn-primitives/portal"
import { act, fireEvent, render, screen } from "@testing-library/react-native"
import * as React from "react"
import { BackHandler } from "react-native"

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

function Example({ footerClose = false }: { footerClose?: boolean }) {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>This permanently removes the project.</DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton={footerClose}>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <PortalHost />
    </>
  )
}

const open = () => fireEvent.press(screen.getByRole("button", { name: "Open dialog" }))

// The title heading is what's reliably queryable while the dialog is open
// (rn-primitives' content view isn't an accessibility element for getByRole).
const title = () => screen.queryByRole("heading", { name: "Delete project?" })

/** Nearest ancestor (or self) whose className includes `cls`. */
function ancestorWithClass(el: ReturnType<typeof screen.getByText>, cls: string) {
  for (let node: typeof el | null = el; node; node = node.parent) {
    if (typeof node.props?.className === "string" && node.props.className.includes(cls)) return node
  }
  return null
}

describe("Dialog", () => {
  test("trigger opens it; title and description are exposed to accessibility", async () => {
    await render(<Example />)
    expect(title()).toBeNull()
    await open()
    expect(title()).toBeOnTheScreen()
    expect(screen.getByText("This permanently removes the project.")).toBeOnTheScreen()
    const panel = ancestorWithClass(title()!, "dialog-panel")
    expect(panel).not.toBeNull()
    expect(panel!.props.role).toBe("dialog")
  })

  test("DialogClose closes it", async () => {
    await render(<Example />)
    await open()
    expect(title()).toBeOnTheScreen()
    await fireEvent.press(screen.getByRole("button", { name: "Cancel" }))
    expect(title()).toBeNull()
  })

  test("the corner close button is labelled 'Close' and closes it", async () => {
    await render(<Example />)
    await open()
    expect(title()).toBeOnTheScreen()
    // By role, not just label: Testing Library's press bubbles to the overlay (which
    // also closes), so only a real labelled button proves the X itself is wired up.
    await fireEvent.press(screen.getByRole("button", { name: "Close" }))
    expect(title()).toBeNull()
  })

  test("DialogFooter showCloseButton renders an outline 'Close' Button that closes it", async () => {
    await render(<Example footerClose />)
    await open()
    const footerClose = screen.getAllByRole("button", { name: "Close" }).find((b) => b.props.className?.includes("btn-outline"))
    expect(footerClose).toBeDefined()
    expect(title()).toBeOnTheScreen()
    await fireEvent.press(footerClose!)
    expect(title()).toBeNull()
  })

  test("Android back button dismisses it", async () => {
    const handlers: Array<Parameters<typeof BackHandler.addEventListener>[1]> = []
    const spy = jest.spyOn(BackHandler, "addEventListener").mockImplementation((_event, handler) => {
      handlers.push(handler)
      return { remove: jest.fn() }
    })
    await render(<Example />)
    await open()
    expect(title()).toBeOnTheScreen()
    expect(handlers.length).toBeGreaterThan(0)
    await act(async () => {
      handlers.at(-1)!({} as never)
    })
    expect(title()).toBeNull()
    spy.mockRestore()
  })
})
