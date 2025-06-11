import type React from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/header";

export const metadata = {
  title: "Journal App",
  description: "A simple journaling application",
};

export default function MindlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div
        className={`flex flex-col min-h-screen`}
        style={{
          background: "linear-gradient(135deg, #00ce8d 0%, #00a1e4 100%)",
          // background:
          //   "linear-gradient(135deg, hsla(187, 100%, 50%, 1) 0%, hsla(183, 84%, 81%, 1) 50%, hsla(143, 75%, 60%, 1) 100%)",
          // filter:
          //   'progid: DXImageTransform.Microsoft.gradient( startColorstr="#00E1FF", endColorstr="#A6F3F7", GradientType=1 )',
        }}
      >
        <Header />
        <main className="flex-1 py-8">
          <div className="container px-4 mx-auto">{children}</div>
        </main>
      </div>
    </ThemeProvider>
  );
}
