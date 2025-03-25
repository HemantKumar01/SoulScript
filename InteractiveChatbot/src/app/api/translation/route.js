"use server";
import axios from "axios";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.json();
    const text = formData.text;
    const targetLanguage = formData.targetLanguage;
    const sourceLanguage = formData.sourceLanguage || "auto";

    // Validate input
    if (!text || text.length > 5000) {
      return NextResponse.json(
        { error: "Invalid input length (1-5000 characters required)" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GCP_TRANSLATE_API;
    console.log("TRanslating", targetLanguage, sourceLanguage);
    const response = await axios.post(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        q: text,
        target: targetLanguage,
        source: sourceLanguage,
        format: "text",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data.data.translations[0]);
  } catch (error) {
    console.error("Translation Error:", error.response?.data || error.message);
    return NextResponse.json(
      {
        error: "Translation failed",
        details: error.response?.data?.error || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
