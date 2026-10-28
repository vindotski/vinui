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

export function App() {
  return (
    <main className="bg-background text-foreground flex min-h-svh items-center justify-center gap-2">
      <Button>Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive" size="sm">
        Delete
      </Button>
      <Button
        variant="ghost"
        onClick={() => document.documentElement.classList.toggle("dark")}
      >
        Toggle dark
      </Button>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>Open dialog</DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This permanently removes the project and all of its data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <DialogClose render={<Button variant="destructive" />}>Delete</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
