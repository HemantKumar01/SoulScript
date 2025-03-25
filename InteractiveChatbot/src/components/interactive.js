"use client";

import ChatInterface, {
  audioBlobToBase64,
  requestSpeechToText,
} from "@/components/chat-interface";
import Sidebar from "@/components/sidebar";
import axios from "axios";
import { useState, useEffect, createContext, useRef } from "react";

export const SettingsContext = createContext(null);
export const MessageLoadingContext = createContext(null);
export default function Chat() {
  const [settings, setSettings] = useState({ audio: true, voiceId: 0 });
  const [messageLoading, setMessageLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: Date.now().toString(),
      user: 1,
      text: "Can you introduce yourself?",
      timestamp: new Date(),
    },
  ]);
  const [audioData, setAudioData] = useState(null);
  const audioRef = useRef();
  useEffect(() => {
    if (audioData && settings.audio) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(audioData);
      audioRef.current.play();
    }
  }, [audioData]);
  useEffect(() => {
    if (!settings.audio && audioRef.current) {
      audioRef.current.pause();
    }
  }, [settings.audio]);
  const requestTextToSpeech = async (text) => {
    const response = await axios.post("/api/text-to-speech", {
      text: text,
      voiceId: settings.voiceId,
    });
    return response;
  };

  const getAnimation = async (base64Audio) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/animate",
        {
          base64Audio: base64Audio,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Access-Control-Allow-Origin": true,
          },
        }
      );
      return response;
    } catch (e) {
      throw e;
    }
  };

  const requestAnswer = async (query) => {
    try {
      //const response = await axios.post("/api/gemini", {
      const response = await axios.post(
        "http://localhost:5000/chat",
        {
          query: query,
          messages: messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      return response;
    } catch (e) {
      throw e;
    }
  };

  const addMessage = (content) => {
    if (!content.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      text: content,
      user: 2,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    setTimeout(async () => {
      setMessageLoading(true);
      const geminiResponse = await requestAnswer(content);
      const answer = geminiResponse.data.text;
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: answer,
        user: 1,
        timestamp: new Date(),
      };
      if (settings.audio) {
        const response = await requestTextToSpeech(answer);
        console.log(response);
        setMessageLoading(false);
        setMessages((prev) => [...prev, assistantMessage]);
        const animation = await getAnimation(response.data.audioContent);
        console.log("Speech Data");
        console.log(animation);
        setAudioData(`data:audio/mp3;base64,${response.data.audioContent}`);
        // const speechObj = await requestSpeechToText(response.data.audioContent);
        // console.log("SpeechData");
        // console.log(speechObj.data.results[0].alternatives[0]);
        return;
      }
      setMessageLoading(false);
      setMessages((prev) => [...prev, assistantMessage]);
    }, 1);
  };
  return (
    <MessageLoadingContext.Provider
      value={{ messageLoading, setMessageLoading }}
    >
      <SettingsContext.Provider value={{ settings, setSettings }}>
        <div className="flex md:flex-row flex-col">
          <Sidebar />
          <div className="flex-1">
            <ChatInterface messages={messages} onSendMessage={addMessage} />
          </div>
        </div>
      </SettingsContext.Provider>
    </MessageLoadingContext.Provider>
  );
}
