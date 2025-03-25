from fastapi import FastAPI,Request
from conv import extract_information_gemini, extract_graph_info  # Ensure these functions exist
import requests
from fastapi.middleware.cors import CORSMiddleware
import re
import json
app = FastAPI()
from fastapi.responses import JSONResponse

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

# API Details
STACK_AI_API_URL = "https://api.stack-ai.com/inference/v0/run/60b84564-8082-4671-ab71-bdc625da5145/67dee63b6d0da965633e6c71"
HEADERS = {
    "Authorization": "Bearer 703f7232-1883-45c6-85ce-b696faf18849",
    "Content-Type": "application/json"
}

# Define the expected payload


@app.post("/getReport")
async def get_body(request: Request):

    
    payload = await request.json()
    
    try:
        
        post_response = requests.post(STACK_AI_API_URL, headers=HEADERS, json=payload)
        post_response.raise_for_status()  # Raises an error for bad responses (4xx and 5xx)
        reasoning_json = post_response.json()  # Ensure the response is valid JSON

        # Extract "out-0" safely
        outputs = reasoning_json.get("outputs", {})
        out_0 = outputs.get("out-0")

        if isinstance(out_0, str):
            out_0 = re.sub(r"```json\s*|\s*```", "", out_0).strip()
            out_0 = json.loads(out_0)  # Convert string to JSON object

        # Extract information using your functions
        info_json = extract_information_gemini(out_0)
        graph_json = extract_graph_info(out_0)
        ans_json = {"info": info_json, "graph": graph_json}  

       
        return JSONResponse(content=ans_json, status_code=200)

    except requests.exceptions.RequestException as e:
        return JSONResponse(content={"error": f"Request failed: {str(e)}"}, status_code=500)
    except json.JSONDecodeError:
        return JSONResponse(content={"error": "Invalid JSON response from Stack AI"}, status_code=500)
    except KeyError:
        return JSONResponse(content={"error": "Missing 'outputs' or 'out-0' key in response"}, status_code=500)