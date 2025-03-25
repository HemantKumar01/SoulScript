import os
from dotenv import load_dotenv
from google import genai
import json
import re

# Load environment variables
load_dotenv()

# Initialize Gemini client with API key from environment
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Explain how AI works",
)

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

def extract_graph_info(json_data):
    # Extract graph information from the JSON data
    prompt = """
```

# Role  
You are a structured data extraction system designed to parse and format JSON data into a well-defined schema. Your goal is to ensure accuracy, consistency, and strict adherence to the specified format while allowing flexibility in field names within each section.  

# Task  
Extract all relevant information that contains a **score** from the provided JSON and return the data strictly in the following format:  

```json

{
  "selfPerception": [
    { "name": <FIELD_NAME>, "score": <SCORE> },
    
  ],
  "relationships": [
    { "name": <FIELD_NAME>, "score": <SCORE> },
    
  ],
  "symptoms": [
    { "name": <FIELD_NAME>, "severity": <SCORE> },
  ]
}



Example-
```json
{
  "selfPerception": [
    { "name": "Self-Esteem", "score": 6 },
    { "name": "Personal Life Support", "score": 8 },
    { "name": "Professional Life Support", "score": 5 }
  ],
  "relationships": [
    { "name": "Family Closeness", "score": 7 },
    { "name": "Friend Closeness", "score": 6 },
    { "name": "Emotional Support", "score": 8 }
  ],
  "symptoms": [
    { "name": "Anxiety", "severity": 8 },
    { "name": "Burnout", "severity": 7 },
    { "name": "Cognitive Issues", "severity": 6 }
  ]
}
```

# Formatting Rules  
- Dynamically include relevant fields from the input data under the appropriate sections.  
- If a field is missing, try to put a value which suits the best after checking the user's condition.
- If additional relevant fields exist, they should be included **without altering the JSON structure**.  
- Ensure all extracted values remain within their correct categories while maintaining logical consistency.  

# Critical Guidelines  
- **Strictly adhere to the output format** while maintaining field flexibility.  
- If some values are **null or missing**, attempt to infer them logically when possible.
-No section should be empty you have to apply some logic and get some values.  
-try to include atleast 3 fields in each section.
- **Do not modify the JSON structure**, but allow variation in field names as required.  
- Return **only** the structured JSON output—no additional text or explanations.  

# Input  :



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




# with open('data.json', 'r') as file:
#     data = json.load(file)


# extracted_data = extract_information_gemini(data)



# if isinstance(extracted_data, str):
    
#     extracted_data = re.sub(r"```json\n|\n```", "", extracted_data).strip()
    
    
#     extracted_data = json.loads(extracted_data)

# with open('output.json', 'w', encoding='utf-8') as file:
#     json.dump(extracted_data, file, ensure_ascii=False)




# score_data=extract_graph_info(data)
# if isinstance(score_data, str):
    
#     score_data = re.sub(r"```json\n|\n```", "", score_data).strip()
    
    
#     score_data = json.loads(score_data)


# with open('score.json', 'w', encoding='utf-8') as file:
#     json.dump(score_data, file, ensure_ascii=False)

# print("Extracted data saved successfully to 'output.json'")


 # # Process the extracted data
        # info_json = extract_information_gemini(reasoning_json)
        # graph_json = extract_graph_info(reasoning_json)