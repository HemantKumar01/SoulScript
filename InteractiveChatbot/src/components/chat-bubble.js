"use client";
import { BotMessageSquare, User } from "lucide-react";
import { useState, useEffect } from "react";
import Markdown from "react-markdown";
import { TypeAnimation } from "react-type-animation";

export default function ChatBubble({ message, lastBotMessage }) {
  const [typingStatus, setTypingStatus] = useState();
  useEffect(() => setTypingStatus(true), []);
  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  return (
    <>
      {message.user == 1 ? (
        <div className="chat place-items-start">
          <div className="chat-header p-2 text-base-content">
            Cassidy •
            <time className="text-xs opacity-50">
              {formatTime(message.timestamp)}
            </time>
          </div>
          <div className="chat-bubble-secondary domine font-semibold shadow-sm max-w-4/5 rounded-md p-2 flex">
            <div className="bg-secondary-content/20 rounded-full w-8 h-8 shrink-0 object-contain overflow-hidden">
              <img
                src="/face.png"
                alt=""
                className="w-full h-full object-contain"
              />
            </div>
            <div className="pl-2 place-self-center ">
              {typingStatus && message == lastBotMessage ? (
                <TypeAnimation
                  sequence={[message.text, () => setTypingStatus(false)]}
                  wrapper="span"
                  speed={80}
                  cursor={false}
                />
              ) : (
                <Markdown>{message.text}</Markdown>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="chat place-items-end">
          <div className="chat-header p-2 text-base-content">
            User •
            <time className="text-xs opacity-50">
              {formatTime(message.timestamp)}
            </time>
          </div>

          <div className="chat-bubble-primary domine font-semibold shadow-sm max-w-4/5 rounded-md p-2 flex">
            <div className="bg-primary-content/20 rounded-full w-8 h-8 shrink-0">
              <User size={16} className="translate-x-[8px] translate-y-[8px]" />
            </div>
            <div className="pl-2 place-self-center ">
              <Markdown>{message.text}</Markdown>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
