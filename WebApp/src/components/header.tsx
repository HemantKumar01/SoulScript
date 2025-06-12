import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PenLine, Calendar } from "lucide-react";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});

export function Header() {
  return (
    <header className="border-b">
      <div className="relative container flex items-center justify-between h-18 px-4 mx-auto w-full pl-10">
        <div className="text-slate-700 hidden md:flex gap-2">
          <Calendar size={22} color="#314158"></Calendar>
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
        <Link
          href="/dashboard/mindlog"
          className={`hidden md:flex  items-center justify-center text-2xl font-bold text-slate-900 ${ClashDisplay.className}`}
        >
          <img
            src="/mindlog_animated.gif"
            alt="mindlog"
            className={`w-[2em] h-auto mx-auto mr-2 mb-2 `}
          />
          Mind Log
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/dashboard/mindlog"
            className="bg-zinc-900 rounded-sm hover:bg-black transition-all"
          >
            <Button
              type="button"
              variant="outline"
              className="border-[#10B981] text-[#ffffff] hover:bg-[#10B981]/10 focus:ring-2 focus:ring-[#10B981]/40 transition"
            >
              <PenLine size={18} />
              <span>New Entry</span>
            </Button>
          </Link>
          <Link
            href="/dashboard/mindlog/calendar"
            className="bg-zinc-900 rounded-sm hover:bg-black transition-all"
          >
            <Button
              type="button"
              variant="outline"
              className="border-[#10B981] text-[#ffffff] hover:bg-[#10B981]/10 focus:ring-2 focus:ring-[#10B981]/40 transition"
            >
              <Calendar size={18} />
              <span>Calendar</span>
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
