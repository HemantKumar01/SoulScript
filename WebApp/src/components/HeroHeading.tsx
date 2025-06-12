import { Typewriter } from "react-simple-typewriter";
import { getCurrentUser, waitForAuthState } from "@/lib/firebase";
import { useState, useEffect } from "react";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});

export default function HeroHeading({ user }: { user?: string }) {
  return user ? (
    <h1
      className={`text-4xl font-regular ${ClashDisplay.className} text-center`}
    >
      Welcome{" "}
      <span className=" tracking-wider bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
        {user}
      </span>
    </h1>
  ) : (
    <></>
  );
}
