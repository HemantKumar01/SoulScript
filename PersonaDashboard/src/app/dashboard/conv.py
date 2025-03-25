from google import genai
import json
import re
import os
from dotenv import load_dotenv

load_dotenv()


client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Explain how AI works",
)


def extract_information_gemini(json_data):
    prompt = """
#role  
You are a structured data extraction system designed to parse and format JSON data into a well-defined schema. Your purpose is to ensure accuracy, consistency, and adherence to the specified format.  

#task  
Extract relevant information from the provided JSON and return the data strictly in the following JSON format:  


{
  "demographics": [
    { "label": "Name", "value": "<NAME>" },
    { "label": "Age", "value": "<AGE>" },
    { "label": "Gender", "value": "<GENDER>" },
    { "label": "Email", "value": "<EMAIL>" }
  ],
  "familyEmployment": [
    { "label": "Employment Status", "value": "<EMPLOYMENT_STATUS>" },
    { "label": "Marital Status", "value": "<MARITAL_STATUS>" },
    { "label": "Children", "value": "<CHILDREN>" }
  ],
  "therapyReasons": [
    { "label": "Primary Reason", "value": "<PRIMARY_REASON_FOR_THERAPY>" },
    { "label": "Daily Impact", "value": "<IMPACT_ON_DAILY_LIFE>" },
    { "label": "Hoped-for Changes", "value": "<HOPED_FOR_CHANGES>" }
  ],
  "mentalHealthHistory": [
    { "label": "Diagnosed Disorder", "value": "<DIAGNOSED_DISORDER>" },
    { "label": "Previous Treatments", "value": "<PREVIOUS_TREATMENTS>" },
    { "label": "Family History", "value": "<FAMILY_MENTAL_HEALTH_HISTORY>" }
  ],
  "selfPerceptionData": [
    { "name": "Self-Esteem", "score": <SELF_ESTEEM_SCORE> },
    { "name": "Family Support", "score": <FAMILY_SUPPORT_SCORE> },
    { "name": "Friend Support", "score": <FRIEND_SUPPORT_SCORE> },
    { "name": "Personal Life Support", "score": <PERSONAL_LIFE_SUPPORT_SCORE> },
    { "name": "Professional Support", "score": <PROFESSIONAL_SUPPORT_SCORE> }
  ],
  "copingStrategies": [
    { "name": "Meditation", "effectiveness": <MEDITATION_EFFECTIVENESS> },
    { "name": "Deep Breathing", "effectiveness": <DEEP_BREATHING_EFFECTIVENESS> },
    { "name": "Journaling", "effectiveness": <JOURNALING_EFFECTIVENESS> },
    { "name": "Exercise", "effectiveness": <EXERCISE_EFFECTIVENESS> },
    { "name": "Mindfulness", "effectiveness": <MINDFULNESS_EFFECTIVENESS> }
  ],
  "therapyRecommendations": [
    { "label": "Cognitive Behavioral Therapy (CBT)", "description": "<CBT_DESCRIPTION>" },
    { "label": "Mindfulness-Based Stress Reduction (MBSR)", "description": "<MBSR_DESCRIPTION>" },
    { "label": "Work-Life Balance Coaching", "description": "<WORK_LIFE_BALANCE_DESCRIPTION>" },
    { "label": "Sleep Hygiene Counseling", "description": "<SLEEP_HYGIENE_DESCRIPTION>" },
    { "label": "Medication Review", "description": "<MEDICATION_REVIEW_DESCRIPTION>" },
    { "label": "Journaling Alternatives", "description": "<JOURNALING_ALTERNATIVES_DESCRIPTION>" }
  ]
}
#critics 
#critics

-Ensure the extracted data strictly adheres to this format.
-If some values are null try to calculate values by yourself through some logical reasoning 
-Do not modify the structure, labels, or variable names.

-Return only the structured JSON output with the correct mappings.

-If a value is missing, use null instead of skipping the field.

-Do not include any additional text or explanations in the output.
"""
    prompt += json.dumps(json_data, indent=4)

    # Use the correct Gemini model

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    return response.text if response else "{}"  # Ensure safe JSON parsing


with open("data.json", "r") as file:
    data = json.load(file)


extracted_data = extract_information_gemini(data)


if isinstance(extracted_data, str):

    extracted_data = re.sub(r"```json\n|\n```", "", extracted_data).strip()

    extracted_data = json.loads(extracted_data)


with open("output.json", "w", encoding="utf-8") as file:
    json.dump(extracted_data, file, ensure_ascii=False)

print("Extracted data saved successfully to 'output.json'")
