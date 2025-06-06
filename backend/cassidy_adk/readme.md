# ADK based multi-agent system for getting follow ups and next questions
### Installation
1. create agent/.env with following content:
```env
GOOGLE_GENAI_USE_VERTEXAI=FALSE
GOOGLE_API_KEY=GEMINI_API_KEY
```
2. download firebase service account credentials (admin) and store as `credentials.json` in root directory
3. Install dependencies and run
```bash
pip install -r requirements.txt
flask run
```
4. try sending request to 
```bash
GET http://127.0.0.1:5000/api/questions/current/<user_id>
POST http://127.0.0.1:5000/api/questions/next/<user_id> body {"user_response":"this is my response to current question"}
```