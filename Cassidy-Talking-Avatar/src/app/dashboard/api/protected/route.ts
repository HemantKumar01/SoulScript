import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // For a simple blog application, we can return public data
    // or implement client-side authentication checks
    return NextResponse.json({
      message: "This is public data - authentication moved to client-side!",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("API Error:", error)
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    )
  }
}
