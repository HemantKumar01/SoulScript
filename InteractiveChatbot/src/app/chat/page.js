"use client";
import { useState, useEffect, createContext, useRef } from "react";
import ChatInterface, {
  audioBlobToBase64,
  requestSpeechToText,
} from "@/components/chat-interface";
import Sidebar from "@/components/sidebar";
import LipSyncAnimation from "@/components/avatar";
import axios from "axios";
import { initialAnimation } from "./initialAnimation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import NonInteractiveChatInterface from "@/components/non-interactive-chat";
import LanguageDropdown from "@/components/langDropdown";
import { redirect } from "next/dist/server/api-utils";
export const SettingsContext = createContext(null);
export const MessageLoadingContext = createContext(null);

export default function Chat() {
  const [settings, setSettings] = useState({
    audio: true,
    voiceId: 0,
    language: "en",
    voiceLang: "en-US",
    interactive: true,
  });
  const [messageLoading, setMessageLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: Date.now().toString(),
      user: 1,
      text: `Hey there! I’m Cassidy, a therapist here to support you. Before we get started, I’d love to get to know a little about you.

Let's start with your name.`,
      timestamp: new Date(),
    },
  ]);
  const [currentMessage, setCurrentMessage] = useState(null);
  const [audioData, setAudioData] = useState(null);
  const [mouthShapeData, setMouthShapeData] = useState("");
  const [showDialog, setShowDialog] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState({
    type: "",
    question: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef();

  useEffect(() => {
    if (audioData && settings.audio) {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audioData);
      audioRef.current.onplaying = () => setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
    }
  }, [audioData]);

  useEffect(() => {
    if (!settings.audio && audioRef.current) {
      audioRef.current.pause();
    }
  }, [settings.audio]);

  const requestTextToSpeech = async (text) => {
    return await axios.post("/api/text-to-speech", {
      text: text,
      voiceId: settings.voiceId,
      language: settings.voiceLang,
    });
  };

  const getAnimation = async (base64Audio) => {
    try {
      setStatusMessage("Cassidy is thinking....");
      const response = await axios.post(
        "http://localhost:5000/animate",
        { base64Audio },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setStatusMessage("");
      return response;
    } catch (e) {
      setStatusMessage("");
      throw e;
    }
  };

  const requestAnswer = async (query, type, question) => {
    try {
      setStatusMessage("Analyzing user response...");
      const response = await axios.post(
        "http://localhost:5000/chat",
        {
          query: query,
          messages: messages,
          type: type,
          follow_up_question: type === "follow-up" ? question : "",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      setStatusMessage("Cassidy is Thinking...");
      return response;
    } catch (e) {
      setStatusMessage("");
      throw e;
    }
  };

  const addMessage = (content) => {
    if (!content.trim()) return;
    const userMessage = {
      id: Date.now().toString(),
      text: content,
      user: 2,
      timestamp: new Date(),
    };
    setCurrentMessage(userMessage);
    setMessages((prev) => [...prev, userMessage]);
    setMessageLoading(true);

    setTimeout(async () => {
      const nextQuestionResponse = await requestAnswer(
        content,
        currentQuestion.question,
        currentQuestion.type
      );
      const question = nextQuestionResponse.data.text;
      // if (question == "No more questions") {
      // redirect("/results");
      // }
      const type = nextQuestionResponse.data.type;
      setCurrentQuestion({ type, question });

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        text: question,
        user: 1,
        timestamp: new Date(),
      };
      console.log(settings.language);

      setMessages((prev) => [...prev, assistantMessage]);
      console.log(settings.language);
      if (settings.audio) {
        const response = await requestTextToSpeech(question);
        if (settings.interactive) {
          const animation = await getAnimation(response.data.audioContent);
          setMouthShapeData(animation.data);
        }
        setAudioData(`data:audio/mp3;base64,${response.data.audioContent}`);

        setTimeout(() => {
          setCurrentMessage(assistantMessage);
          setMessageLoading(false);
        }, 500);

        return;
      }

      setCurrentMessage(assistantMessage);
      setMessageLoading(false);
    }, 1);
  };

  const playInitialMessage = async () => {
    const initialMessage = messages[0];
    setAudioData(`/initial_message.wav`);
    setMouthShapeData(initialAnimation);
    setCurrentMessage(initialMessage);
  };
  const changeLanguage = (language) => {
    setSettings((prev) => ({
      ...prev,
      voiceLang: language == "en" ? "en-US" : "hi-IN",
      language: language.code,
      voiceId: language == "en" ? 0 : 1,
    }));
  };
  useEffect(() => {
    if (currentMessage && currentMessage.user == 1) {
      translateMessage();
    }
  }, [settings, currentMessage]);
  const translateMessage = async () => {
    if (!currentMessage) return;
    if (settings.language == "en") {
      return;
    }
    console.log(currentMessage);
    try {
      // Stop the current audio and animation
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setAudioData(null);
      setMouthShapeData("");
      // Request translation
      const response = await axios.post("/api/translation", {
        text: currentMessage.text,
        targetLanguage: settings.language,
        sourceLanguage: "en",
      });

      const translatedText = response.data.translatedText;

      // Update the message with the translated text
      const translatedMessage = { ...currentMessage, text: translatedText };
      // setCurrentMessage(translatedMessage);
      console.log(translateMessage);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === currentMessage.id ? translatedMessage : msg
        )
      );

      // Request text-to-speech with the translated text
      const ttsResponse = await requestTextToSpeech(translatedText);

      if (settings.interactive) {
        const animation = await getAnimation(ttsResponse.data.audioContent);
        setMouthShapeData(animation.data);
      }

      setAudioData(`data:audio/mp3;base64,${ttsResponse.data.audioContent}`);
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  return (
    <MessageLoadingContext.Provider
      value={{ messageLoading, setMessageLoading }}
    >
      <SettingsContext.Provider value={{ settings, setSettings }}>
        <div
          className="relative flex flex-col items-center justify-start h-screen  text-gray-900 p-8"
          style={{
            background: "linear-gradient(135deg, #66d4a8, #59b5df)",
          }}
        >
          <div className="background fixed z-0 text-[20vw] font-black left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-3/4 text-white opacity-10">
            <div>CASSIDY</div>
          </div>
          {showDialog && (
            <Dialog
              open={showDialog}
              onOpenChange={setShowDialog}
              className="z-[100000]"
            >
              <DialogContent className="bg-white shadow-lg rounded-lg p-6 z-[100000]">
                <DialogHeader className="text-2xl font-semibold text-center">
                  <DialogTitle className="text-3xl">
                    Welcome to PersonaBot
                  </DialogTitle>
                </DialogHeader>
                <div className="text-medium text-gray-600 text-left">
                  <p>
                    This is Cassidy, your personal therapist. you can talk about
                    yourself to cassidy and at end she will create a
                    consolidated persona for you. She will be asking a bunch of
                    questions (and some follow ups if needed).
                  </p>
                  <p className="mt-4">
                    depending on your responses,
                    <strong>the session might take 15-20 minutes.</strong> Start
                    now to get your persona.
                  </p>
                </div>
                <DialogFooter className="flex justify-center mt-4">
                  <Button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                    onClick={() => {
                      setShowDialog(false);
                      setTimeout(playInitialMessage, 1000);
                    }}
                  >
                    Start Conversation
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <div className="absolute top-5 right-5 flex items-center space-x-2 z-200">
            <span className="text-gray-700">Interactive Mode</span>
            <Switch
              checked={settings.interactive}
              onCheckedChange={() => {
                setStatusMessage("");
                setSettings((prev) => ({
                  ...prev,
                  interactive: !prev.interactive,
                }));
              }}
            />
          </div>
          <div className="absolute top-20 right-5 flex items-center space-x-2 z-200 bg-[#ffffffc7] p-4 rounded-lg">
            <span className="text-gray-700">Select Language: </span>
            <LanguageDropdown onSelect={changeLanguage}></LanguageDropdown>
          </div>
          {statusMessage && settings.interactive && (
            <div className="absolute top-5 bg-white p-5 rounded-full z-100 left-1/2 -translate-x-1/2 text-gray-600 text-sm font-medium mb-2">
              {statusMessage}
            </div>
          )}
          {settings.interactive ? (
            <div
              className={`relative transition-all duration-300 p-0 rounded-lg pb-0`}
              style={{
                boxShadow: isPlaying ? "0 0 40px rgba(0, 0, 0, 0.337)" : "none",
                scale: isPlaying ? 1.02 : 1,
              }}
            >
              <LipSyncAnimation
                audioFile={audioData}
                mouthShapeData={mouthShapeData}
              />
            </div>
          ) : (
            <></>
          )}

          {currentMessage && settings.interactive && (
            <div className="text-center text-xl font-semibold mt-4 p-4 bg-gray-100 rounded-lg shadow-md max-w-[700px]">
              {currentMessage.text}
            </div>
          )}

          <div className="w-full h-auto absolute bottom-0">
            {settings.interactive ? (
              <ChatInterface messages={messages} onSendMessage={addMessage} />
            ) : (
              <NonInteractiveChatInterface
                messages={messages}
                onSendMessage={addMessage}
              />
            )}
          </div>
        </div>
      </SettingsContext.Provider>
    </MessageLoadingContext.Provider>
  );
}
