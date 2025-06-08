from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio

from chat import reflection_chatbot
from dataSync import isPersonaUpdateNeeded, personaInfo, updatePersona
import json

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/getReport")
async def get_report(request: Request):
    try:
        payload = await request.json()
        authId = payload.get("authId")

        if not authId:
            return JSONResponse(content={"error": "Missing authId in request"}, status_code=400)
        if(isPersonaUpdateNeeded(authId)):
            info_json, graph_json = await updatePersona(authId)
        else:
            user_info = personaInfo(authId)
            if user_info:
                user_info_json = json.loads(user_info)
                info_json, graph_json = user_info_json.get("Info"), user_info_json.get("Graph")
            else:
                # Handle the case where user_info is None or empty
                return JSONResponse(content={"error": "User information not found or is empty"}, status_code=404)

        return JSONResponse(content={"info": info_json, "graph": graph_json}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": f"Internal server error: {str(e)}"}, status_code=500)

@app.post("/chat")
async def chat(request: Request):
    try:
        payload = await request.json()
        authId = payload.get("authId")
        user_message = payload.get("userMessage")
        user_info = personaInfo(authId)

        if not authId or not user_message:
            return JSONResponse(content={"error": "Missing authId or userMessage in request"}, status_code=400)

        if not isPersonaUpdateNeeded(authId) or not user_info is None:
            # Generate RAG response
            rag_response = reflection_chatbot(user_message=user_message, user_info=user_info)
        else:
            # Update persona and then generate RAG response
            updatePersona(authId, user_message)
            rag_response = reflection_chatbot(user_message=user_message, user_info=user_info)
        if not rag_response:
            return JSONResponse(content={"error": "No response generated"}, status_code=404)

        return JSONResponse(content={"response": rag_response}, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": f"Internal server error: {str(e)}"}, status_code=500)