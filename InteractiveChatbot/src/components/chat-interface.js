"use client";
import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
import ChatBubble from "./chat-bubble";
import { Mic, Send } from "lucide-react";
import { MessageLoadingContext } from "@/app/chat/page";
import { motion } from "framer-motion";

export const audioBlobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const arrayBuffer = reader.result;
      const base64Audio = btoa(
        new Uint8Array(arrayBuffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );
      resolve(base64Audio);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob);
  });
};

export const requestSpeechToText = async (base64Audio) => {
  try {
    const response = await axios.post("/api/speech-to-text", { base64Audio });
    if (response.data.results?.length > 0) {
      return response.data.results[0].alternatives[0].transcript;
    }
    return "";
  } catch (error) {
    console.error("Speech-to-Text API error:", error);
    return "";
  }
};

export default function ChatInterface({ messages, onSendMessage }) {
  const [inputValue, setInputValue] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState("");
  const { messageLoading } = useContext(MessageLoadingContext);
  const messagesEndRef = useRef(null);
  const audioChunks = useRef([]);

  useEffect(() => {
    axios.get("http://localhost:5000/init");
  }, []);

  useEffect(() => {
    return () => {
      if (mediaRecorder) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [mediaRecorder]);

  useEffect(() => {
    setInputValue(transcription);
  }, [transcription]);

  const processAudioChunk = async (chunk) => {
    const base64Audio = await audioBlobToBase64(chunk);
    const transcript = await requestSpeechToText(base64Audio);
    setTranscription((prev) => (prev ? `${prev} ${transcript}` : transcript));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunks.current = [];
      setRecording(true);
      setMediaRecorder(recorder);

      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          await processAudioChunk(event.data);
        }
      };

      recorder.start();

      // Request small chunks of audio continuously
      const interval = setInterval(() => {
        if (recorder.state === "recording") {
          recorder.requestData();
        }
      }, 2000); // Every 2 seconds, send audio data

      recorder.onstop = () => {
        clearInterval(interval);
        stream.getTracks().forEach((track) => track.stop());
      };
    } catch (error) {
      console.error("Microphone access error:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  return (
    <div className="p-8 w-full flex flex-col justify-center items-center">
      <div className="w-full flex items-center justify-center">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage(inputValue);
            setInputValue("");
          }}
          className="w-full flex justify-center items-center"
        >
          <label className="input flex items-center  rounded-lg px-4 py-2 w-full max-w-[700px] shadow-md bg-white">
            {recording && (
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="bg-red-500 w-3 h-3 rounded-full mr-2"
              />
            )}
            <input
              onChange={(e) => setInputValue(e.target.value)}
              type="text"
              value={inputValue}
              placeholder={recording ? "Listening..." : "Type a message..."}
              className="text-base-content flex-1 outline-none bg-transparent"
              readOnly={recording}
            />
            {recording ? (
              <Mic
                onClick={stopRecording}
                className="text-red-500 cursor-pointer ml-2"
                size={28}
              />
            ) : (
              <Mic
                onClick={startRecording}
                className="text-gray-500 cursor-pointer ml-2"
                size={28}
              />
            )}
            <Send
              onClick={() => onSendMessage(inputValue)}
              className="text-gray-500 cursor-pointer ml-2"
              size={25}
            />
          </label>
        </form>
      </div>
      {recording && (
        <motion.div
          className="mt-4 w-40 h-6 bg-blue-300 rounded-full"
          animate={{ scaleX: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 0.6 }}
        />
      )}
    </div>
  );
}
