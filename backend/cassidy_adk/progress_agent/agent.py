from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.tools.agent_tool import AgentTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from dotenv import load_dotenv
from pydantic import BaseModel
import json
import os

load_dotenv()

GEMINI_MODEL = "gemini-2.0-flash"


BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class Progress(BaseModel):
    answered_questions: list[str]


questions_json_path = os.path.join(BASE_DIR, "questions_flat.json")
with open(questions_json_path, "r", encoding="utf-8") as file:
    questions_data = json.load(file)
progress_agent = LlmAgent(
    name="ProgressAgent",
    model=GEMINI_MODEL,
    instruction=f"""You are a progress tracking AI for a mental health therapy application. Your task is to analyze a set of questions and a conversation between a user and therapist, and determine the number of questions asked by the therapist and completely answered by the user. If same question is asked multiple times, it should be counted only once if answered completely. Also questions are asked serially, so if a question is not answered, any question after that should not be counted as answered.

    Full Question Set: {questions_data}

    Return only in the following format:
    {{
        "answered_questions": <array of answered questions from full questoin set>,
    }}
    Note that the answered questions should be continuous, meaning if a question is not answered, any question after that should not be counted as answered. The conversation will be provided in the next message.
  
""",
    description="Analyzes a set of questions, and a conversation between a user and therapist, and determines the number of questions completely answered by the user.",
    output_key="progress_agent",
    output_schema=Progress,
)


# For ADK tools compatibility, the root agent must be named `root_agent`
root_agent = progress_agent


# Agent Interaction
async def call_agent(query):
    APP_NAME = "ProgressAgent"
    USER_ID = "user1234"
    SESSION_ID = "1234"

    # Session and Runner
    session_service = InMemorySessionService()
    session = await session_service.create_session(
        app_name=APP_NAME, user_id=USER_ID, session_id=SESSION_ID
    )
    runner = Runner(
        agent=root_agent, app_name=APP_NAME, session_service=session_service
    )

    content = types.Content(role="user", parts=[types.Part(text=query)])
    events = runner.run(user_id=USER_ID, session_id=SESSION_ID, new_message=content)

    for event in events:
        if event.is_final_response():
            final_response = event.content.parts[0].text
            return final_response


async def track_progress(user_id, message_history):
    # load questions_flat.json as questions

    query = f"""
therapist user conversation: {message_history} 
"""
    res = await call_agent(query)
    return res
