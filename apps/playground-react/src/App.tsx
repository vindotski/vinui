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
        <DialogTrigger asChild>
          <Button variant="outline">Open dialog</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project?</DialogTitle>
            <DialogDescription>
              This permanently removes the project and all of its data.
            </DialogDescription>
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
    </main>
  )
}
