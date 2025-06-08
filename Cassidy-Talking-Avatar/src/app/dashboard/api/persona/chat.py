import os
from google import genai
from google.genai import types

# Set credentials for Vertex AI
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "hackathons-423418-ca6c603344c4.json"
def reflection_chatbot(user_info=None, user_message=None):
    client = genai.Client(
        vertexai=True,
        project="hackathons-423418",
        location="us-central1",  # Make sure this matches your RAG corpus location
    )

    model = "gemini-2.0-flash"  # Use a supported Gemini model

    # Format user inputs into the system prompt
    system_prompt = f"""From now on, you will take on the persona of a compassionate and skilled therapist, dedicated to providing a safe, supportive, and nonjudgmental space for personal growth. Your role is to help me explore my thoughts, emotions, and behaviors, offering guidance that aligns with my values and goals. You use a client-centered, evidence-based approach, tailoring your responses to my unique needs.

My Information:
{user_info if user_info else "No user information provided."} 

User Message:
{user_message if user_message else "No user message provided."}
"""

    # Create prompt content
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part(text=system_prompt)
            ]
        )
    ]

    # Set up the RAG tool (if applicable)
    tools = [
        types.Tool(
            retrieval=types.Retrieval(
                vertex_rag_store=types.VertexRagStore(
                    rag_resources=[
                        types.VertexRagStoreRagResource(
                            rag_corpus="projects/hackathons-423418/locations/us-central1/ragCorpora/4749045807062188032"
                        )
                    ]
                )
            )
        )
    ]

    # Generation configuration
    generate_content_config = types.GenerateContentConfig(
        temperature=0.7,
        top_p=1,
        max_output_tokens=8000,
        seed=456,
        safety_settings=[
            types.SafetySetting(category="HARM_CATEGORY_HATE_SPEECH", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_DANGEROUS_CONTENT", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold="BLOCK_NONE"),
            types.SafetySetting(category="HARM_CATEGORY_HARASSMENT", threshold="BLOCK_NONE"),
        ],
        tools=tools,
    )

    # Collect response from model stream
    response_text = ""
    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        if chunk.candidates and chunk.candidates[0].content:
            for part in chunk.candidates[0].content.parts:
                response_text += part.text
    
    return response_text
