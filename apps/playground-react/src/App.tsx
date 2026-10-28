import { Button } from "@/components/ui/button"

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
    </main>
  )
}
