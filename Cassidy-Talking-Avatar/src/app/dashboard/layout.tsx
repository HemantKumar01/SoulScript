import type { Metadata } from "next";
import "../App.scss";
import "../globals.css";
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

export const metadata: Metadata = {
  title: "Cassidy - SoulScript",
  description: "Your personal AI therapist",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <SidePanel />
      <MainContent>
        {children}
      </MainContent>
    </SidebarProvider>
  );
}






  