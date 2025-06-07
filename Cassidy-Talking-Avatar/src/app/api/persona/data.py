import os
from dotenv import load_dotenv
from google import genai
import json
import firebase_admin
from firebase_admin import credentials
from google.cloud import firestore
import re
import pandas as pd
# Load environment variables
load_dotenv()

# Read the API key from the environment
api_key = os.getenv("NEXT_PUBLIC_GEMINI_API_KEY")

# Initialize the genai client with the API key
client = genai.Client(api_key=api_key)
# Set credentials for Vertex AI
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "secrets/hackathons-423418-ca6c603344c4.json"

# Initialize Firebase Admin
cred = credentials.Certificate("secrets/service.json")
firebase_admin.initialize_app(cred)

# Initialize Firestore client using the same credentials
db = firestore.Client(credentials=cred.get_credential(), project=cred.project_id)

EMOTIONS = ["Joy", "Sadness", "Anger", "Fear", "Surprise", "Disgust", "Neutral"]
def json_to_md(authID):

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




    """

    #document_id = authId
    document_id = authID

    # Fetch the document
    doc_ref = db.collection('users').document(document_id)
    doc = doc_ref.get()

    # Check if the document exists
    if doc.exists:
        data = doc.to_dict()
        user_history = data.get('userHistory')
        
        
        prompt += json.dumps(user_history, indent=2)

    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return response.text if response else "Error generating Markdown."
    except Exception as e:
        return f"Error: {str(e)}"


def data_chat_extraction(authId, response_format="json"):
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
4. If the user doesn't want to respond to any question, then please mention that the user doesn't want to share that information.  
5. Ensure data is clean, structured, and properly formatted in JSON.  

**#critics**  
- Extract all relevant insights without misinterpretation.  
- Avoid unnecessary labels such as "Additional Insights" and instead integrate those details naturally into the JSON structure.  
- Ensure logical structuring, clarity, and accuracy, especially when handling missing or ambiguous responses.  
- Keep responses concise yet comprehensive in the JSON output.  
- Don't put the final output inside ```json   ```
    
Input:
"""

    document_id = authId
    doc_ref = db.collection('users').document(document_id)
    doc = doc_ref.get()

    if not doc.exists:
        return {"error": "Document not found"}

    data = doc.to_dict()
    user_history = data.get('userHistory')

    if not user_history:
        return {"error": "User history not found"}

    prompt += json.dumps(user_history, indent=2)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=prompt,
    )

    response_text = response.candidates[0].content.parts[0].text.strip()
    response_text = response_text.replace("```json", "").replace("```", "")

    if response_format == "json":
        try:
            return json.loads(response_text)
        except json.JSONDecodeError:
            json_match = re.search(r"{[\s\S]*}", response_text)
            if json_match:
                try:
                    json_str = json_match.group(0)
                    return json.loads(json_str)
                except:
                    pass
            return {
                "error": "Could not parse response",
                "raw_response": response_text,
            }
    else:
        return response_text




import pandas as pd
import json
from google.cloud import firestore


def analyze_with_llm(prompt, system_prompt="You are an expert psychologist analyzing journal entries."):
    full_prompt = f"{system_prompt}\n\n{prompt}"

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[full_prompt],  # <-- must be a list of strings or Part instances
       
    )

    return response.text


# Your analysis pipeline
def analyze_journal_entries(authId):
    # Firestore client
    db = firestore.Client(credentials=cred.get_credential(), project=cred.project_id)

    # Fetch latest 10 journal entries for the user
    journal_ref = db.collection("users").document(authId).collection("journalEntries")
    query = journal_ref.order_by("date", direction=firestore.Query.DESCENDING).limit(5)
    snapshot = query.stream()

    # Convert to DataFrame-compatible structure
    records = []
    for doc in snapshot:
        data = doc.to_dict()
        records.append({
            "_id": doc.id,
            "title": data.get("title", ""),
            "date": data.get("date"),
            "content": data.get("content", "")
        })

    if not records:
        return pd.DataFrame()

    entries_df = pd.DataFrame(records)

    # Your existing analysis logic continues here
    analysis_results = []
    for _, entry in entries_df.iterrows():
        analysis_prompt = f"""
        Analyze this journal entry as a psychologist. Focus on key insights and actionable takeaways:

        Title: {entry['title']}
        Date: {entry['date']}
        Content: {entry['content']}

        Provide a concise yet comprehensive analysis covering:
        1. Emotional state (primary and secondary emotions)
        2. Cognitive patterns (positive/negative, rational/irrational)
        3. Stress indicators and coping mechanisms
        4. Notable behavioral patterns
        5. Key concerns or growth opportunities
        6. Specific recommendations for improvement

        Format your response with clear bullet points for each category.
        """
        analysis_text = analyze_with_llm(analysis_prompt)

        summary_prompt = f"""
        Summarize this psychological analysis into 1-2 key actionable insights from the journal entry:
        {analysis_text}

        Focus on the most important takeaways that the journal writer should pay attention to.
        Format as bullet points.
        """
        summary_text = analyze_with_llm(summary_prompt)

        emotion_prompt = f"""
        Analyze this journal entry and quantify the emotional content:
        {entry['content']}

        Return ONLY a JSON dictionary with values between 0-1 for these emotions: 
        {EMOTIONS}
        Example: {{"Joy": 0.5, "Sadness": 0.3, ...}}
        """
        try:
            emotion_json = analyze_with_llm(
                emotion_prompt,
                system_prompt="You are an emotion analysis tool. Return ONLY valid JSON.",
            )
            emotion_data = json.loads(emotion_json.strip("`").replace("json\n", ""))
        except:
            emotion_data = {e: 0 for e in EMOTIONS}

        analysis_results.append({
            "entry_id": entry["_id"],
            "date": entry["date"],
            "title": entry["title"],
            "analysis": analysis_text,
            "summary": summary_text,
            "emotions": emotion_data,
        })

    return json.dumps(analysis_results, indent=2, default=str)
