import os
from dotenv import load_dotenv
from google import genai
import json
import re
import pandas as pd
from google import genai
from google.genai import types



# Load environment variables from .env file
load_dotenv()

# Read the API key from the environment
api_key = os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")

# Initialize the genai client with the API key
client = genai.Client(api_key=api_key)
# Set credentials for Vertex AI
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "secrets/hackathons-423418-ca6c603344c4.json"


EMOTIONS = ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Neutral"]

# Initialize Gemini client with API key from environment
# client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def extract_information_gemini(json_data):
    prompt = """
```
#role  
You are a structured data extraction system designed to parse and format JSON data into a well-defined schema. Your purpose is to ensure accuracy, consistency, and adherence to the specified format while allowing flexibility in the fields within each section.  

#task  
Extract relevant information from the provided JSON and return the data strictly in the following JSON format:  

```json
{
  "demographics": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "familyEmployment": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "therapyReasons": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "mentalHealthHistory": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "traumaAndAdverseExperiences": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "substanceUse": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "healthAndLifestyle": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
 
  "medicalAndMedicationHistory": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "behavioralPatterns": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "riskAssessment": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "psychologicalFormulation": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "strengthsAndResources": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ],
  "therapyRecommendations": [
    { "label": "<FIELD_NAME>", "value": "<FIELD_VALUE>" }
  ]
}
```

### Rules for Formatting:
- Each section should dynamically include relevant fields from the input data.  
- If a field is missing, it should be included with `"value": "Not Provided"` instead of being skipped.  
- If additional relevant fields exist, they should be added under the appropriate section without modifying the structure.    
- Ensure that all extracted values remain in their correct categories while maintaining logical consistency.  

#critics  
- Ensure the extracted data strictly adheres to this format while maintaining flexibility in the fields.  
- If some values are null, try to infer them logically when possible.  
- Do not modify the JSON structure, but allow flexibility in the field names within each section.  
- Return only the structured JSON output without additional text or explanations. 
-take your time , ill give you a treat if you do not hallucinate.
 Input:
"""
        
    
    #
    prompt += json.dumps(json_data, indent=2)

    # Use the correct Gemini model
      
    response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=prompt,
      )

    extracted_data=response.text
    if isinstance(extracted_data, str):
            
          extracted_data = re.sub(r"```json\n|\n```", "", extracted_data).strip()
            
            
          extracted_data = json.loads(extracted_data)
          return extracted_data
    return {}

def extract_graph_info(json_data):
    # Extract graph information from the JSON data
  
    prompt = """
# Role  
You are a structured data extraction and inference system designed to parse user psychological profiles and generate a scored JSON schema. Your goal is to ensure accuracy, completeness, and logical scoring even when exact numeric values are not provided.

# Task  
Extract all relevant information that relates to **self-perception**, **relationships**, or **symptoms** from the provided JSON input. If scores or severity levels are **not explicitly mentioned**, infer them logically based on the language and emotional tone of the content. Then, output the data strictly in the following format:

```json
{
  "selfPerception": [
    { "name": <FIELD_NAME>, "score": <SCORE> }
  ],
  "relationships": [
    { "name": <FIELD_NAME>, "score": <SCORE> }
  ],
  "symptoms": [
    { "name": <FIELD_NAME>, "severity": <SCORE> }
  ]
}
````

# Scoring Inference Rules

* Use natural language understanding to assign a score between **1 and 10**.
* A **negative** or concerning tone (e.g., persistent self-doubt, anxiety) implies a **lower score**.
* A **neutral** tone implies a **mid-range score** (e.g., 5–6).
* A **positive** or resilient tone (e.g., pride in task completion, emotional insight) implies a **higher score**.
* For **symptoms**, severity should be **higher** if the symptom is described in strong or persistent terms.

# Formatting Rules

* Include **at least 3 fields** per section.
* Choose **field names** dynamically based on the context.
* Do **not leave any section empty**. If the data is insufficient, infer the best possible estimates.
* Ensure the final structure is **valid JSON** and **strictly follows the format**.
* Do **not return anything other than the final JSON output**.

# Input :

"""



    prompt += json.dumps(json_data, indent=4)

    # Use the correct Gemini model
  
        
    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    extracted_data=response.text
    if isinstance(extracted_data, str):
        
        extracted_data = re.sub(r"```json\n|\n```", "", extracted_data).strip()
        
        
        extracted_data = json.loads(extracted_data)
        return extracted_data
    return {}






def generate_rag(chat_data=None, journal_analysis=None):
    client = genai.Client(
        vertexai=True,
        project="hackathons-423418",
        location="us-central1",  # Make sure this matches your RAG corpus location
    )

    model = "gemini-2.0-flash"  # Use a supported Gemini model

    # Format user inputs into the system prompt
    system_prompt = f"""You are an advanced mental health reasoning agent tasked with developing a comprehensive psychological profile based on user data.

# USER CHAT DATA
{chat_data if chat_data else "No chat data provided."}

# JOURNAL ANALYSIS
{journal_analysis if journal_analysis else "No journal analysis provided."}

Using all the information above, create a detailed psychological profile with the following components:

1. EXTRACTED INFORMATION: Clearly organize factual information from the user's responses.
2. SYMPTOM ANALYSIS: Identify potential mental health conditions based on reported symptoms and compare to clinical criteria.
3. BEHAVIORAL PATTERNS: Identify recurring patterns in behavior, thoughts, and emotions.
4. PSYCHOLOGICAL FORMULATION: Develop a formulation that explains how the user's history, predisposing factors, and current circumstances interact.
5. RISK ASSESSMENT: Evaluate any potential risks (to self or others) and protective factors.
6. STRENGTHS AND RESOURCES: Identify positive coping strategies, support systems, and personal strengths.
7. RECOMMENDATIONS: Suggest evidence-based interventions that might be helpful.
For each section, detail your reasoning process and highlight any uncertainties in your conclusions. Clearly distinguish between observed data and inferred conclusions.
Format the output as JSON with these sections as keys.
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
        max_output_tokens=4000,
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