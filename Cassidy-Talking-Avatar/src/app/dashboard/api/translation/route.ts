import { NextResponse } from "next/server";

export async function POST(request: Request) {
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
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
          source: sourceLanguage,
          format: "text",
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data.data.translations[0]);
  } catch (error: any) {
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