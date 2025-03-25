"use client";
import axios from "axios";
import { useState, useRef, useEffect, useContext } from "react";
import ChatBubble from "./chat-bubble";
import { Mic, Send, Upload } from "lucide-react";
import { MessageLoadingContext } from "@/app/chat/page";

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
  console.log("Requesting speech to text");
  const response = await axios.post(
    //			`https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
    "/api/speech-to-text",
    {
      base64Audio: base64Audio,
    }
  );
  return response;
};

export default function NonInteractiveChatInterface({
  messages,
  onSendMessage,
}) {
  const [inputValue, setInputValue] = useState("");
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [transcription, setTranscription] = useState("");
  const { messageLoading, setMessageLoading } = useContext(
    MessageLoadingContext
  );
  const messagesEndRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.start();
      console.log("Recording started");

      // Event listener to handle data availability
      recorder.addEventListener("dataavailable", async (event) => {
        console.log("Data available event triggered");
        const audioBlob = event.data;

        const base64Audio = await audioBlobToBase64(audioBlob);

        try {
          const startTime = performance.now();

          const response = await requestSpeechToText(base64Audio);
          const endTime = performance.now();
          const elapsedTime = endTime - startTime;

          console.log("Time taken (ms):", elapsedTime);

          if (response.data.results && response.data.results.length > 0) {
            console.log(response.data.results);
            setTranscription(
              response.data.results[0].alternatives[0].transcript
            );
          } else {
            console.log(
              "No transcription results in the API response:",
              response.data
            );
            setTranscription("");
          }
        } catch (error) {
          console.error("Error with Google Speech-to-Text API:", error);
        }
      });

      setRecording(true);
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error getting user media:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      console.log("Recording stopped");
      setRecording(false);
      setInputValue(transcription);
    }
  };

  useEffect(() => {
    messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  return (
    <div className="p-8 bg-base-100 border-2 shadow-sm border-base-300 h-screen flex flex-col">
      <div className="overflow-y-auto flex-1 p-2">
        <h1 className="text-4xl font-bold py-8 text-base-content alfa">
          PersonaBot
        </h1>
        {messages &&
          messages.map &&
          messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m}
              lastBotMessage={messages[messages.length - 1]}
            />
          ))}
        {messageLoading ? (
          <span className="loading loading-dots loading-xl text-base-content"></span>
        ) : (
          <></>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div>
        <form onSubmit={handleSubmit} className="place-self-stretch flex">
          <label className="input grow outline-none border-base-300 w-full bg-base-200 p-4 text-base-500 text-lg">
            <input
              onChange={(e) => setInputValue(e.target.value)}
              type="text"
              value={inputValue}
              placeholder="Send a message..."
              className="text-base-content"
            />
            {/* <Upload className="text-gray-500 translate-x-[-20px]" size={28} />
            {recording ? (
              <Mic
                onClick={stopRecording}
                className="text-primary translate-x-[-10px]"
                size={28}
              />
            ) : (
              <Mic
                onClick={startRecording}
                className="text-gray-500 translate-x-[-10px]"
                size={28}
              />
            )} */}
            <Send
              onClick={handleSubmit}
              className="text-gray-500 translate-x-[-5px]"
              size={25}
            />
          </label>
        </form>
      </div>
    </div>
  );
}
