"use server";
import axios from "axios";
import { NextResponse } from "next/server";
import { ElevenLabsClient } from "elevenlabs";

export async function POST(request) {
  // const voices = [
  //   "en-IN-Wavenet-B",
  //   "en-IN-Wavenet-A",
  //   "en-IN-Wavenet-C",
  //   "en-IN-Wavenet-D",
  // ];
  const voices = ["en-US-Chirp3-HD-Aoede"];
  const voices = ["en-US-Chirp3-HD-Aoede"];

  // Fixed SSML generation with proper mark placement
  function textToSSML(text) {
    const words = text.split(" ");
    let ssml = "<speak>";
    words.forEach((word, index) => {
      ssml += `${word}<mark name="m${index + 1}"/> `;
    });
    ssml += "</speak>";
    return ssml;
  }

  // Simplified markdown cleanup
  function markdownToNaturalText(mdText) {
    return mdText
      .replace(/[`#*_{}[\]()!]/g, "") // Remove all markdown syntax
      .replace(/\s+/g, " ") // Collapse whitespace
      .trim();
  }

  try {
    const formData = await request.json();
    const input = markdownToNaturalText(formData.text);
    const voiceId = formData.voiceId;

    // Validate input
    if (!input || input.length > 5000) {
      return NextResponse.json(
        { error: "Invalid input length (1-5000 characters required)" },
        { status: 400 }
      );
    }

    const ssml = textToSSML(input);
    const apiKey = process.env.GCP_TTS_API;

    const response = await axios.post(
      `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${apiKey}`,
      {
        //input: { ssml },
        input: { text: input },
        voice: {
          languageCode: "en-US",
          name: voices[voiceId % voices.length],
        },
        audioConfig: {
          audioEncoding: "LINEAR16",
          // speakingRate: 1.1,
          // pitch: 0,
        },
        enableTimePointing: ["SSML_MARK"],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Convert audioContent to base64 URL
    const audioData = response.data.audioContent;
    const audioUrl = `data:audio/mp3;base64,${audioData}`;

    // const client = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API });
    //
    // const speechObj = await client.textToSpeech.convertWithTimestamps(
    //   "21m00Tcm4TlvDq8ikWAM",
    //   {
    //     text: input,
    //   },
    // );
    // console.log(speechObj);
    //
    return NextResponse.json(response.data);
  } catch (error) {
    console.error("TTS Error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "TTS conversion failed",
        details: error.response?.data?.error || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
