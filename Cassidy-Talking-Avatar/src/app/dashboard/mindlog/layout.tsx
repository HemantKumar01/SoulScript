import type React from "react"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"

export const metadata = {
  title: "Journal App",
  description: "A simple journaling application",
}

export default function MindlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4 mx-auto">{children}</div>
        </main>
        <footer className="py-4 text-center text-sm text-light border-t">
          <div className="container">
            {new Date().toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </div>
        </footer>
      </div>
    </ThemeProvider>
  )
}

