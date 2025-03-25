import os
from dotenv import load_dotenv
import google.generativeai as genai
import json

# Load environment variables
load_dotenv()

# Initialize Gemini client with API key from environment
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents="Explain how AI works",
    
)



def json_to_md(json_data):
    """
    Convert JSON data to Markdown format using Gemini API.
    """
    prompt = """
    
    # Role  
    You are an intelligent system designed to extract and organize key information from unstructured text. Your objective is to identify relevant details and present them in a structured **Markdown format** for clear readability.  

    ## Task  
    Analyze the given input and extract meaningful insights related to:  
    - Personal background  
    - Experiences  
    - Lifestyle  
    - Relationships  
    - Overall well-being  

    Present the extracted information **exclusively in Markdown format**, ensuring proper use of headers, lists, and bold text where necessary.  
    Dont put the final output inside ```markdown   ```
    ## Guidelines  
    - Capture relevant personal and situational details.  
    - Identify recurring themes or concerns.  
    - Use appropriate Markdown syntax (e.g., `#`, `##`, `-`, `**bold**`).  
    - Ensure logical structuring for easy interpretation.  
    - If information is incomplete or unclear, infer context when reasonable.  
    -Dont put the final output inside ```markdown   ```




    """+ json.dumps(json_data, indent=4)
    

    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text if response else "Error generating Markdown."
    except Exception as e:
        return f"Error: {str(e)}"


def extract_information_gemini(json_data):
    prompt = """
**#role**  
You are an advanced data extraction system designed to process therapy questionnaire responses and convert them into structured JSON format. Your goal is to extract key details while maintaining accuracy, completeness, and logical structuring.  

**#task**  
1. Extract essential details from the provided therapy questionnaire responses.  
2. Structure the output in JSON format with the following fields:  
   - **Personal Information**: Name, Age, Gender, Contact  
   - **Employment & Lifestyle**: Employment Status, Relationship Status, Daily Routine  
   - **Mental Health History**: Past Diagnoses, Previous Treatments, Family History of Mental Health Conditions  
   - **Trauma History**: Significant Life Events, Impact, Coping Mechanisms  
   - **Behavioral Patterns**: Substance Use, Addiction or Compulsive Behaviors  
   - **Support System**: Social Support, Family & Friends' Role  
   - Other relevant details such as stressors, triggers, current emotional state, and therapy goals should be included naturally without using a generic label like "Additional Insights."  
3. If any responses are missing or unclear, mark the respective field as `"unclear"`.
4.If the user doesnt want to repsond to any question then please mention user doesnt want to share that information.  
4. Ensure data is clean, structured, and properly formatted in JSON.  

**#critics**  
- Extract all relevant insights without misinterpretation.  
- Avoid unnecessary labels such as "Additional Insights" and instead integrate those details naturally into the JSON structure.  
- Ensure logical structuring, clarity, and accuracy, especially when handling missing or ambiguous responses.  
- Keep responses concise yet comprehensive in the JSON output.
    Input:
    """
    prompt += json.dumps(json_data, indent=4)

    # Use the correct Gemini model
  
    response = client.models.generate_content(
    model="gemini-2.0-flash",
    contents=prompt,
)

    return response.text if response else "{}"  # Ensure safe JSON parsing

# Load JSON Data
with open('therapy_questionnaire.json', 'r') as file:
    data = json.load(file)

extracted_data = extract_information_gemini(data)
md_format = json_to_md(data)

# Save Markdown output to a file
with open("output.md", "w", encoding="utf-8") as f:
    f.write(md_format)

# Print confirmation message
print("Markdown file saved as output.md")

# TODO : It takes chat responses, from the chatbot model , so sort the naming shit 