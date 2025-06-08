import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate that authId is provided
    if (!body.authId) {
      return NextResponse.json(
        { error: 'authId is required' },
        { status: 400 }
      );
    }

    console.log('Forwarding request to external API with authId:', body.authId);

    // Forward the request to the external API
    const response = await fetch(process.env.NEXT_PRIVATE_REPORTGEN_CHATBOT+'/getReport', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Check if the external API request was successful
    if (!response.ok) {
      console.error('External API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `External API responded with status ${response.status}` },
        { status: response.status }
      );
    }

    // Parse the response from the external API
    const data = await response.json();
    
    console.log('Successfully received response from external API');

    // Return the data from the external API
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error in getReport API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}