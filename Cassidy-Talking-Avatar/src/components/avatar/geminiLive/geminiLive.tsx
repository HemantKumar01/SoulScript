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
import { useEffect, memo, useState } from "react";
import { useLiveAPIContext } from "@/contexts/LiveAPIContext";
import {
  FunctionDeclaration,
  LiveServerToolCall,
  Modality,
  Type,
} from "@google/genai";
import { getCurrentUser, waitForAuthState } from "@/lib/firebase";

const declaration: FunctionDeclaration = {
  name: "get_question",
  description: "Gets next question to be asked to the user",
  parameters: {
    type: Type.OBJECT,
    properties: {
      user_current_answer: {
        type: Type.STRING,
        description:
          "User response to current question, summarize the response if multiple follow ups are asked for the same main question. must be string not json.",
      },
    },
    required: [],
  },
};
async function getNextQuestion(
  user_current_answer: string,
  user_id: string
): Promise<string> {
  console.log("Getting next question");
  return new Promise(async (resolve, reject) => {
    const response = await fetch(
      "http://cassidy-questions-api.onrender.com/api/questions/next/" + user_id,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_response: user_current_answer,
        }),
      }
    );
    const quesData = await response.json();
    console.log("quesData", quesData);
    resolve(quesData.data);
  });
}
function GeminiLiveComponent() {
  const { client, setConfig, setModel } = useLiveAPIContext();
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setUserName(user.displayName || "Friend");
      setUserId(user.uid);
    } else {
      waitForAuthState().then((user) => {
        if (user) {
          setUserName(user.displayName || "Friend");
          setUserId(user.uid);
        } else {
          console.error("User is not authenticated");
          window.location.href = "/login"; // Redirect to login if not authenticated
        }
      });
    }
  }, []);

  useEffect(() => {
    setModel("models/gemini-2.5-flash-preview-native-audio-dialog");

    if (!userName || !userId.length) {
      return;
    }
    setConfig({
      responseModalities: [Modality.AUDIO],
      inputAudioTranscription: {},
      outputAudioTranscription: {},
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Leda" } },
        // other possible voices : Autotune, Callirhoe, Laomedeia
      },
      systemInstruction: {
        parts: [
          {
            text: `You are a helpful and supportive friend named cassidy. You talk in a soft and lovely tone and love talking to people.Start by telling hi to first name of the person (or the main name) and be casual. Then introduce yourself and ask the person if they are ready to start. Once they are ready to start get next question to ask. You are also their mental health support agent, and you are here to help ${userName} with their mental health issues. You have to ask some questions your friend. Once the user is ready, after every response you need get a question and ask user that question. you can get questions by calling get_question function. If a previous question is already asked provide ${userName}'s complete response to current main question as argument to get_question function (summarize into one response if multiple small follow ups are asked for a main questoin). If no question is returned, then talk about anything interesting with your friend.
            The use details are given as below:
            name: ${userName}
            `,
          },
        ],
      },
      tools: [{ functionDeclarations: [declaration] }],
    });
  }, [setConfig, setModel, userId, userName]);

  useEffect(() => {
    const onToolCall = async (toolCall: LiveServerToolCall) => {
      console.log("Tool call received", toolCall);
      if (!toolCall.functionCalls) {
        return;
      }
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name
      );
      let res = {
        question:
          "No further questions left. talk about anything interesting with user.",
      };
      if (fc) {
        const current_answer = (fc.args as any).user_current_answer;
        res.question = await getNextQuestion(current_answer, userId);
      }

      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls?.map((fc) => ({
                response: { output: res.question },
                id: fc.id,
                name: fc.name,
              })),
            }),
          1
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, userId]);
  // const embedRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (embedRef.current && jsonString) {
  //     console.log("jsonString", jsonString);
  //     vegaEmbed(embedRef.current, JSON.parse(jsonString));
  //   }
  // }, [embedRef, jsonString]);
  return (
    <div className="cassidy bg-white">
      <div></div>
    </div>
  );
}

export const GeminiLive = memo(GeminiLiveComponent);
