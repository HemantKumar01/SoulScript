"use client";

import React from "react";
import { useSidebar } from "./SidePanel";

interface MainContentProps {
  children: React.ReactNode;
}

const MainContent: React.FC<MainContentProps> = ({ children }) => {
  const { isCollapsed } = useSidebar();

  return (
    <div
      className={`
        h-screen transition-all duration-300 ease-in-out relative
        ${isCollapsed ? "ml-16" : "ml-64"}
      `}
      style={{
        width: `calc(100vw - ${isCollapsed ? "4rem" : "16rem"})`,
      }}
    >
      {children}
    </div>
  );
};

export default MainContent;
