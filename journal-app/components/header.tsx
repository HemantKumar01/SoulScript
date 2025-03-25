import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenLine, Calendar } from "lucide-react"

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-4 mx-auto">
        <Link href="/" className="text-xl font-bold">
          Journal App
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <PenLine size={18} />
              <span>New Entry</span>
            </Button>
          </Link>
          <Link href="/calendar">
            <Button variant="ghost" className="flex items-center gap-2">
              <Calendar size={18} />
              <span>Calendar</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

