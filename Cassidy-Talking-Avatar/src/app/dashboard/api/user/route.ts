import { NextResponse } from 'next/server'
import type { NextRequest } from "next/server"

export async function GET(req: NextRequest) {
  try {
    // Since we've moved to client-side authentication,
    // user data is now handled directly on the client side
    // This endpoint can be used for other server-side user operations if needed
    return NextResponse.json({
      message: "User authentication is now handled client-side",
      note: "Use Firebase Auth directly in your React components"
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
