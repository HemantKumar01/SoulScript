import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PenLine, Calendar } from "lucide-react"

export function Header() {
  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 px-2 mx-auto">
        <Link href="/mindlog" className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
          Mind.Log 
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/mindlog">
            <Button
               type="button"
               variant="outline"
                         
               className="border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 focus:ring-2 focus:ring-[#10B981]/40 transition"
               ><PenLine size={18} />
              <span>New Entry</span>
              </Button>
            {/* <Button variant="ghost" className="flex items-center gap-2 border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 focus:ring-2 focus:ring-[#10B981]/40 transition">
              <PenLine size={18} />
              
            </Button> */}
          </Link>
          <Link href="/mindlog/calendar">
            <Button
               type="button"
               variant="outline"
                         
               className="border-[#10B981] text-[#10B981] hover:bg-[#10B981]/10 focus:ring-2 focus:ring-[#10B981]/40 transition"
               >
              <Calendar size={18} />
              <span>Calendar</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}

