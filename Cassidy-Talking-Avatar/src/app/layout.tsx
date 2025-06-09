<<<<<<< HEAD
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./App.scss";
import "./globals.css";
import "tailwindcss/index.css";
import SidePanel from "@/components/SidePanel";
import { SidebarProvider } from "@/components/SidePanel";
import MainContent from "@/components/MainContent";

// NOTE : resolve sidepanel and cassidy rebuttal
// this shud work well - but smhow bg is lost in cassidy
// to hemant: check this out duriing final ui maxxing
{
  /* <SidebarProvider>
          <SidePanel />
          <MainContent>
            {children}
          </MainContent>
        </SidebarProvider> */
}
=======
import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
>>>>>>> a50c8c2e50351b3bce4a889fd89618b64aff4cdb

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoulScript - AI-Powered Therapy",
  description: "Accessible therapy through AI, bridging the gap when traditional therapy feels out of reach.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
<<<<<<< HEAD
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SidebarProvider>
          <SidePanel />
          <MainContent>{children}</MainContent>
        </SidebarProvider>
=======
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
>>>>>>> a50c8c2e50351b3bce4a889fd89618b64aff4cdb
      </body>
    </html>
  )
}
