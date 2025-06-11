/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use client";
import { LiveAPIProvider } from "@/contexts/LiveAPIContext";
import ControlTray from "@/components/avatar/control-tray/ControlTray";
import { LiveClientOptions } from "../types";
import { GeminiLive } from "@/components/avatar/geminiLive/geminiLive";
import Cassidy from "@/components/avatar/cassidy/cassidy";
import AIChatInterface from "@/components/chat/interface";
import { Switch } from "@/components/ui/switch";
import { requireAuth } from "@/lib/firebase";
import { useEffect, useState } from "react";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
import Progress from "@/components/avatar/progress/progress";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set NEXT_PUBLIC_GEMINI_API_KEY in .env");
}

const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
};

function Home() {
  useEffect(() => {
    requireAuth();
  }, []);
  return (
    <div className="App w-full h-full">
      <LiveAPIProvider options={apiOptions}>
        <DualChatbotElement></DualChatbotElement>
      </LiveAPIProvider>
    </div>
  );
}
const DualChatbotElement = () => {
  const [InteractiveMode, setInteractiveMode] = useState<boolean>(true);
  const { connected, connect, disconnect } = useLiveAPIContext();

  useEffect(() => {
    if (!InteractiveMode) {
      if (!connected) {
        connect();
      }
    }
  }, [InteractiveMode, connected, connect]);

  return (
    <div
      className="relative h-full w-full bg-[#00ce8d]"
      style={{
        background: "linear-gradient(135deg, #00ce8d 0%, #00a1e4 100%)",
        // background:
        //   "linear-gradient(135deg, hsla(178, 100%, 50%, 1) 0%, hsla(302, 100%, 50%, 1) 100%)",
        // background:
        //   "linear-gradient(90deg, hsla(285, 42%, 33%, 1) 0%, hsla(333, 54%, 51%, 1) 100%)",
      }}
    >
      <div
        className={`banner-text fixed z-[0] w-[100vh] h-auto top-1/2 transform -translate-y-1/2 right-0 text-[120px] font-[900] text-[#ffffff] text-center opacity-10 origin-center -rotate-90 translate-x-[calc(50%-0.5em)] select-none ${ClashDisplay.className}`}
      >
        CASSIDY
      </div>

      <main
        style={{
          display: InteractiveMode ? "block" : "none",
        }}
      >
        <Cassidy></Cassidy>
        <GeminiLive></GeminiLive>
        <ControlTray InteractiveMode={InteractiveMode}></ControlTray>
      </main>
      <main
        style={{
          display: InteractiveMode ? "none" : "block",
        }}
      >
        <AIChatInterface InteractiveMode={InteractiveMode}></AIChatInterface>
      </main>
      <div className="absolute top-0 right-5  z-50 flex items-center gap-2 justify-center p-5 rounded-lg">
        <div className="text-zinc-700">Chat</div>
        <Switch
          checked={InteractiveMode}
          onCheckedChange={() => {
            setInteractiveMode(!InteractiveMode);
          }}
        ></Switch>
        <div className="text-zinc-700">Talk</div>
      </div>
      <div
        className={`absolute   z-10 bg-white/20 p-5  text-white transition-all duration-300 ease-in-out ${
          InteractiveMode
            ? "hidden md:block left-auto right-2 bottom-2 rounded-xl"
            : "hidden"
        }`}
      >
        <Progress className="relative"></Progress>
      </div>
    </div>
  );
};

export default Home;
