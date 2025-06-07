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
 {/* <SidebarProvider>
          <SidePanel />
          <MainContent>
            {children}
          </MainContent>
        </SidebarProvider> */}


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cassidy - SoulScript",
  description: "Your personal AI therapist",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      
      
        <SidebarProvider>
          <SidePanel />
          <MainContent>
            {children}
          </MainContent>
        </SidebarProvider>
        
        
      </body>
    </html>
  );
}






  