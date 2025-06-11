"use client";

import "../../App.scss";
import "../../globals.css";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";
import { useAuthId } from "@/hooks/use-auth-id";
import localFont from "next/font/local";
const ClashDisplay = localFont({
  src: "../../../fonts/ClashDisplay_Complete/Fonts/WEB/fonts/ClashDisplay-Variable.woff2",
});
type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const authId = useAuthId();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    return () => {
      window.removeEventListener("resize", checkIfMobile);
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput("");

    try {
      // Using your Next.js API route instead of calling external API directly
      const response = await fetch("api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authId: authId,
          userMessage: userMessage.content,
        }),
      });

      const data = await response.json();

      // Add assistant response
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't process your request.",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);

      // Add error message from assistant
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Sorry, something went wrong. Please try again.",
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to render message content
  const renderMessageContent = (content: string, role: string) => {
    if (role === "user") {
      return <p>{content}</p>;
    } else {
      // For assistant messages, render markdown
      return <ReactMarkdown>{content}</ReactMarkdown>;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-md text-white py-4 px-6 shadow-lg flex justify-center items-center border-b border-slate-700">
        <h1
          className={`flex items-center justify-center text-xl md:text-2xl font-regular tracking-tight ${ClashDisplay.className}`}
        >
          <img
            src="/know_yourself_reveal_animated.gif"
            alt="reflection"
            className="h-[1.5em] w-auto mr-2"
          />
           Reflections
        </h1>
        {/* <Button
          variant="outline"
          className="text-black border-slate-600 hover:bg-slate-900 hover:text-white"
          onClick={() => router.push("/dashboard")}
        >
          Dashboard
        </Button> */}
      </header>

      {/* Chat Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
         <div
        className={`banner-text fixed z-[20] pointer-events-none w-[100vh] h-auto top-1/2 transform -translate-y-1/2 right-0 text-[95px] font-[900] text-[#ffffff] text-center opacity-5 origin-center -rotate-90 translate-x-[calc(50%-0.5em)] select-none ${ClashDisplay.className}`}
      >
      Reflections
      </div>
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div
                className={`inline-block bg-slate-700/50 p-8 rounded-xl shadow-xl ${ClashDisplay.className}`}
              >
                <img
                  src="/know_yourself_animated.gif"
                  alt="look into you"
                  className="w-25 h-25 mx-auto my-5"
                />
                <p className="text-xl font-medium text-slate-50">
                  Start a conversation to{" "}
                  <span className=" text-[#47ff9d]">know yourself better</span>
                </p>
                <p className="text-sm mt-2 text-slate-400">
                  Ask me anything about self-reflection, personal growth, or
                  mindfulness
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] md:max-w-[70%] rounded-xl px-5 py-3 shadow-md ${
                    message.role === "user"
                      ? "bg-[#47ff9d] text-slate-900 rounded-br-none"
                      : "bg-slate-700 text-slate-200 rounded-bl-none"
                  }`}
                >
                  {renderMessageContent(message.content, message.role)}
                </div>
              </div>
            ))
          )}

          {/* Thinking bubble */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-700 text-slate-200 rounded-xl rounded-bl-none px-5 py-3 shadow-md max-w-[80%] md:max-w-[70%]">
                <div className="flex space-x-1.5">
                  <div className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-bounce"></div>
                  <div
                    className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                  <div
                    className="h-2.5 w-2.5 bg-slate-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.4s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700 bg-slate-800/70 backdrop-blur-md p-4 shadow-top-lg">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-3 items-center"
        >
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 rounded-lg focus:ring-sky-500 focus:border-sky-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            size={isMobile ? "icon" : "default"}
            disabled={isLoading}
            className="bg-[#47ff9d] hover:bg-[#00ff77] text-black rounded-lg cursor-pointer"
          >
            {isMobile ? (
              <Send size={18} />
            ) : (
              <>
                <Send size={18} className="mr-2" /> Send
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
