import "../App.scss";
import "../globals.css";
import SidePanel from "@/components/SidePanel";
import { SidebarProvider } from "@/components/SidePanel"; 
import MainContent from "@/components/MainContent";

export const metadata = {
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






  