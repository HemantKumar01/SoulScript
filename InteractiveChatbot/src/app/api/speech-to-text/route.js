"use server";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  const formData = await request.json();
  const base64Audio = formData.base64Audio;
  try {
    const apiKey = process.env.GCP_SPEECHTOTEXT_API;
    const response = await axios.post(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,

      {
        config: {
          encoding: "MP3",
          sampleRateHertz: 48000,
          enableWordTimeOffsets: true,
          languageCode: "en-UK",
        },
        audio: {
          content: base64Audio,
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
