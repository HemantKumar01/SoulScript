from google.adk.agents import LlmAgent, SequentialAgent
from google.adk.tools.agent_tool import AgentTool
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from .tools import get_next_question, get_current_question
from dotenv import load_dotenv

load_dotenv()

GEMINI_MODEL = "gemini-2.0-flash"


follow_up_generator = LlmAgent(
    name="followUpAgent",
    model=GEMINI_MODEL,
    instruction="""
You are a follow-up question generator AI. The user has answered a question asked by the therapist, but not completely. Your task is to generate a follow-up question based on the user's answer to a therapy question. 
""",
    description="Generates a follow-up question based on the user's answer to a therapy question.",
    output_key="follow_up",  # Stores output in state['follow_up']
)

answer_reviewer_agent = LlmAgent(
    name="AnswerReviewerAgent",
    model=GEMINI_MODEL,
    instruction="""
You are a helper agent to a mental therapist. The mental therapist has asked the user some question, and the user has provided an answer. Your task is to review the user's answer and tell if the answer is complete or not. That is, you have to check if the user has answered all parts of the question asked by the therapist.
If the answer is not complete, call the follow_up_generator agent tool to generate a follow-up question based on the user's answer. Provide the therapist's question and user's answer as it is to the follow_up_generator tool (provide it as a single string).

If the answer is complete and satisfactory, (or the user tells they don't want to answer the question) call the get_next_question tool to get the next question for the user. If the next question is not available, return empty string.

return only the question to be asked as a string and nothing else or empty string if no question provided.
""",
    description="Reviews user provided answers to therapy questions and determines if they are complete and provides the next question if available",
    output_key="answer_review",
    tools=[
        get_next_question,
        AgentTool(agent=follow_up_generator),
    ],
)


# For ADK tools compatibility, the root agent must be named `root_agent`
root_agent = answer_reviewer_agent


# Agent Interaction
async def call_agent(query):
    APP_NAME = "TherapistQuestionManager"
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


async def analyze_user_response(user_id, user_response):
    query = f"""
user_id: {user_id}
Therapist's question: {get_current_question(user_id).get('questionText', '')}
User's answer: {user_response}
"""
    res = await call_agent(query)
    return res
