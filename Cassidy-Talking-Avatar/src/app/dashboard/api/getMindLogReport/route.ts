import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json()
    const { authId, email, numdays } = body

    // Validate required fields
    if (!authId || !email || !numdays) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          error_code: 'VALIDATION_ERROR',
          message: 'authId, email, and numdays are required'
        },
        { status: 400 }
      )
    }

    // Validate numdays
    if (typeof numdays !== 'number' || numdays < 1 || numdays > 365) {
      return NextResponse.json(
        { 
          error: 'Invalid numdays value',
          error_code: 'VALIDATION_ERROR',
          message: 'numdays must be a number between 1 and 365'
        },
        { status: 400 }
      )
    }

    

    // Forward the request to the external API
    const externalApiResponse = await fetch(
      process.env.NEXT_PRIVATE_REPORTGEN_CHATBOT+'/getMindLogReport',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          authId,
          email,
          numdays,
        }),
      }
    )

   

    // Get the response text first
    const responseText = await externalApiResponse.text()
  

    // Try to parse JSON
    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch (parseError) {
     
      return NextResponse.json(
        { 
          error: 'Invalid response from external service',
          error_code: 'EXTERNAL_API_ERROR',
          message: 'Failed to parse response from external service'
        },
        { status: 502 }
      )
    }

    // If external API returned an error status
    if (!externalApiResponse.ok) {
    
      
      // Forward the error response with appropriate status
      return NextResponse.json(
        responseData,
        { status: externalApiResponse.status }
      )
    }

    // Success case - forward the successful response
  
    return NextResponse.json(responseData, { status: 200 })

  } catch (error: any) {
    

    // Handle different types of errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Failed to connect to external service',
          error_code: 'NETWORK_ERROR',
          message: 'Unable to reach the report generation service. Please try again later.'
        },
        { status: 503 }
      )
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          error_code: 'PARSE_ERROR',
          message: 'Invalid JSON in request body'
        },
        { status: 400 }
      )
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Internal server error',
        error_code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while processing your request'
      },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { 
      error: 'Method not allowed',
      error_code: 'METHOD_NOT_ALLOWED',
      message: 'This endpoint only supports POST requests'
    },
    { status: 405 }
  )
}