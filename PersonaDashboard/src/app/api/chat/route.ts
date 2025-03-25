import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextRequest, NextResponse } from 'next/server';
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the current file's directory path
// Use process.cwd() to get the project root directory and build a relative path
const dataPath = path.join(process.cwd(), 'src', 'app', 'api', 'chat', 'data.txt');
let defaultData = "Default fallback data";

try {
  // Use synchronous file reading only during initialization
  defaultData = fs.readFileSync(dataPath, "utf-8");
} catch (err: any) {
  console.error(`Error reading data.txt: ${err.message}`);
}

// Allow streaming responses up to 30 seconds
export const maxDuration = 300

async function query(data: Record<string, any>) {
  const response = await fetch(
    process.env.STACK_AI_ENDPOINT || "https://api.stack-ai.com/inference/v0/run/60b84564-8082-4671-ab71-bdc625da5145/67e2334ea00467fb5c701b80",
    {
      headers: {
        'Authorization': `Bearer ${process.env.STACK_AI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  const result = await response.json();
  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, userData, userId } = body;
    console.log(defaultData);
    // Prepare the data payload for Stack AI
    const stackAIData = {
      "in-1": message,
      "user_id": userId || "<USER or Conversation ID>",
      "in-0": userData || defaultData
    };
    
    // Call Stack AI API
    const stackResponse = await query(stackAIData);
    console.log(stackResponse);
    
    // Get the main response content
    const responseText = stackResponse?.outputs?.["out-0"] || "Sorry, no response was generated.";
    
    // Return the raw response text without any additional processing
    // The frontend will handle the markdown rendering
    return NextResponse.json({ 
      response: responseText
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', response: "Sorry, something went wrong. Please try again." },
      { status: 500 }
    );
  }
}

