import asyncio
from data import data_chat_extraction, analyze_journal_entries
from conv import extract_information_gemini, generate_rag, extract_graph_info

import firebase_admin
from firebase_admin import credentials
from google.cloud import firestore
import json

# Initialize Firebase Admin
cred = credentials.Certificate("service.json")

def isPersonaUpdateNeeded(authId=None, updateRequired=None):
    db = firestore.Client(credentials=cred.get_credential(), project=cred.project_id)

    if updateRequired is not None:
        # If updated is provided, update the user's persona update status
        user_ref = db.collection("users").document(authId)
        user_ref.set({"updatePersona": updateRequired}, merge=True)
        return updateRequired

    user_ref = db.collection("users").document(authId)
    user_doc = user_ref.get()
    if user_doc.exists:
        updateNeeded = user_doc.to_dict().get("updatePersona", True)
        return updateNeeded
    return True

def personaInfo(authId=None, newInfo=None):
    db = firestore.Client(credentials=cred.get_credential(), project=cred.project_id)

    user_ref = db.collection("users").document(authId)
    persona_ref = user_ref.collection("persona")
    doc_snapshots = persona_ref.get()
    
    if(newInfo is not None):
        # If newInfo is provided, update or create the document
        if doc_snapshots:
            # Update the first document if it exists
            first_doc = doc_snapshots[0]
            first_doc.reference.set({"Info": newInfo, "Date": firestore.SERVER_TIMESTAMP}, merge=True)
        else:
            # Create a new document with the provided info
            persona_ref.add({"Info": newInfo, "Date": firestore.SERVER_TIMESTAMP})

    # If no newInfo is provided, just retrieve the existing info
    # Initialize persona_info_value to None
    # Retrieve the "Info" field from the first document in the collection

    persona_info_value = None
    if doc_snapshots: 
        first_doc_data = doc_snapshots[0].to_dict()
        if first_doc_data: # Check if to_dict() returned a dictionary (it should if doc exists)
            persona_info_value = first_doc_data.get("Info") # Get the "Info" field
    # print(f"Persona Info Value: {persona_info_value}")  # Debugging line to check the value
    return persona_info_value
    
async def updatePersona(authId=None, user_message=None):
    db = firestore.Client(credentials=cred.get_credential(), project=cred.project_id)

    # Step 1: Extract chat + journal data using authId
    chat_data = data_chat_extraction(authId, "json")
    journal_json = analyze_journal_entries(authId)

    # Step 2: Generate combined RAG result
    rag_result = generate_rag(chat_data=chat_data, journal_analysis=journal_json)

    # Step 3: Extract info + graph in parallel
    info_task = asyncio.to_thread(extract_information_gemini, rag_result)
    graph_task = asyncio.to_thread(extract_graph_info, rag_result)
    info_json, graph_json = await asyncio.gather(info_task, graph_task)

    # Step 4: Store the extracted info and graph in Firestore
    temp = {"Info": info_json, "Graph": graph_json}
    temp_string = json.dumps(temp)
    personaInfo(authId, newInfo=temp_string)

    # Step 5: update the user's persona update status
    isPersonaUpdateNeeded(authId,updateRequired=False) 

    return info_json, graph_json