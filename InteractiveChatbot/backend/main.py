import json
import os
from groq import Groq
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
import base64

app = Flask(__name__)
CORS(app)
load_dotenv()

<<<<<<< HEAD
client = Groq(
    api_key=os.environ.get(
        "GROQ_API_KEY", "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"
    )
)
=======
# Initialize Groq client with API key from environment
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
>>>>>>> 1be0c8a60714ccef228d5d3d4bfe049f9d20a419
model_name = "llama3-70b-8192"


class PsychologicalAssessmentSystem:
    def __init__(self, questions_data):
        self.questions_data = questions_data
        self.user_history = []
        self.aggregated_responses = {}
        self.current_question_id = 0
        self.question_index = -1

    def reset(self):
        self.questions_data = questions_data
        self.user_history = []
        self.aggregated_responses = {}
        self.current_question_id = 0
        self.question_index = -1

    def _generate_response(self, prompt, response_format=None):
        """Generate responses from the Groq API."""
        response = client.chat.completions.create(
            model=model_name,
            temperature=1,
            max_tokens=8192,
            top_p=0.95,
            messages=[
                {
                    "role": "system",
                    "content": """
You are an empathetic, professional mental health therapist chatbot conducting an intake interview. 
Your goal is to gather comprehensive information about the user's mental health, personal history, lifestyle, and experiences.

Important guidelines:
1. Maintain a warm, empathetic, and non-judgmental tone.
2. Ask open-ended and follow-up questions to gather detailed information.
3. Validate the user's feelings and use therapeutic communication techniques.
4. Focus on collecting information, not providing therapy or diagnoses.
5. Ensure to be to the point and keep the conversation relevant.

Your purpose is to gather information, not to provide therapeutic interventions.
""",
                },
                {"role": "user", "content": prompt},
            ],
        )
        response_text = response.choices[0].message.content
        response_text = response_text.strip()
        response_text = response_text.replace("```json", "").replace("```", "")

        if response_format == "json":
            try:
                return json.loads(response_text)
            except json.JSONDecodeError:
                import re

                json_match = re.search(
                    r"```json\s*([\s\S]*?)\s*```|{[\s\S]*}", response_text
                )
                if json_match:
                    try:
                        json_str = (
                            json_match.group(1)
                            if json_match.group(1)
                            else json_match.group(0)
                        )
                        return json.loads(json_str)
                    except:
                        pass
                return {
                    "error": "Could not parse response",
                    "raw_response": response_text,
                }
        else:
            return response_text

    def get_next_question(self):
        """Get the next question to present to the user."""
        self.question_index += 1
        self.current_question_id = self.question_index

        prompt = f"""
        You are an agent that selects psychological assessment questions.
        Current question: {json.dumps(self.questions_data[self.question_index])}
        
        Expected Elements in answer: {self.questions_data[self.question_index]["expected_from_answer"]}

        Create a personalized, simplified, small question from given question.
        If this is the first question, select an introductory one.
        Make sure not to deviate too much from the current question.
        Output only the question string and nothing else.
        """

        result = self._generate_response(prompt)
        return result

    def process_user_response(
        self, user_response, is_follow_up=False, follow_up_question=""
    ):
        """Process a user response through the agent pipeline."""
        current_question = self.questions_data[self.current_question_id]

        # Store response
        if self.current_question_id not in self.aggregated_responses:
            self.aggregated_responses[self.current_question_id] = {
                "question": current_question["question"],
                "responses": [user_response],
                "section": current_question["section"],
            }
        else:
            self.aggregated_responses[self.current_question_id]["responses"].append(
                user_response
            )

        # Check for follow-up needs
        all_responses = self.aggregated_responses[self.current_question_id]["responses"]

        prompt = f"""
        You are an agent that evaluates psychological assessment responses. Your task is to identify if the user answered all the necessary elements in the response.
        
        Question: {current_question["question"]}
        User response: {".".join(all_responses)}
        expected from answer: {current_question["expected_from_answer"]}

        {is_follow_up and f"Follow-up Question: {follow_up_question}"}
        {is_follow_up and f"Follow-up Response: {user_response}"}
        
        
        Check if the user addressed all elements or they can be derived from user's response.
        For any missing elements, create a specific simplified and small follow-up question.

        Important Instruction: If the user says that he/she does not want to answer a follow up question about the missing element, then skip that part, return skip as true.
        
        Return only JSON in the following format and nothing else:
       {{"complete": true or false (if all elements are addressed),
       "skip":true or false (whether user want to skip this part,irrespective of compelte)
        "follow_up_question": a question to get information about missing elements, or empty string if complete
        }}
        """

        result = self._generate_response(prompt, "json")

        # print(prompt)
        # print(result)
        if result.get("error"):
            print("Error:", result)
            exit(1)
        # Check if follow-up is needed
        if (
            result.get("skip", True)
            or result.get("complete", False)
            or result.get("follow_up_question")
            in [
                "",
                None,
                "None",
            ]
            or not result.get("follow_up_question")
        ):
            self._aggregate_responses(skip=result.get("skip", False))
            return {"status": "complete"}
        else:
            return {"status": "follow_up", "question": result.get("follow_up_question")}

    def _aggregate_responses(self, skip=False):
        """Aggregate all responses for the current question."""
        current_question = self.questions_data[self.current_question_id]
        all_responses = self.aggregated_responses[self.current_question_id]["responses"]

        # For now concatenating all responses for a question and it's follow up to form a single response.
        aggregated_response = ".".join(all_responses)
        if skip:
            aggregated_response += (
                ". The user does not want to answer missing part in this question."
            )
        print(aggregated_response)
        # Store the aggregated response and add to history
        self.user_history.append(
            {
                "question": current_question["question"],
                "user_response": aggregated_response,
                "section": current_question["section"],
            }
        )

        return aggregated_response

    def save_responses(self):
        """Save all responses to a JSON file."""
        with open("responses.json", "w") as f:
            json.dump(self.user_history, f, indent=2)
        print("Responses saved to responses.json")


def load_questions_from_json():
    """Load questions from questions.json and convert to the required format."""
    with open("questions.json", "r") as f:
        sections_data = json.load(f)

    questions_data = []

    for section, questions in sections_data.items():
        for question_item in questions:
            questions_data.append(
                {
                    "question": question_item["question"],
                    "expected_from_answer": question_item["expected_answer"],
                    "section": section,
                }
            )

    return questions_data


# Load questions from JSON file
questions_data = load_questions_from_json()

# Initialize the system
assessment_system = PsychologicalAssessmentSystem(questions_data)


def run_assessment():
    try:
        question = assessment_system.get_next_question()
        print(f"Question: {question}")

        # Get user response
        user_response = input("Your answer: ")

        # Process the initial response
        result = assessment_system.process_user_response(user_response)

        # Handle follow-up questions if needed
        while result.get("status") == "follow_up":
            print(f"Follow-up: {result['question']}")
            follow_up_response = input("Your answer: ")
            result = assessment_system.process_user_response(
                follow_up_response,
                is_follow_up=True,
                follow_up_question=result["question"],
            )

        print("Response recorded. Moving to next question...")
        print("---")
    except Exception as e:
        print(f"An error occurred: {e}")


# COMMENT FROM HERE TO RUN LOCALLY HERE
# wrap into /init path or hardcode first question on frontend
@app.route("/init", methods=["GET"])
def init_system():
    assessment_system.reset()
    question = assessment_system.get_next_question()
    return jsonify(), 200


@app.route("/chat", methods=["POST"])
def post_json():
    data = request.get_json()
    user_response = data["query"]
    question_type = data["type"]
    follow_up_question = data["follow_up_question"]

    if assessment_system.question_index < len(questions_data) - 1:
        result = assessment_system.process_user_response(
            user_response,
            is_follow_up=question_type == "follow_up",
            follow_up_question=follow_up_question,
        )
        if result.get("status") == "follow_up":
            return jsonify({"text": result["question"], "type": "follow-up"}), 200
        if result["status"] == "complete":
            question = assessment_system.get_next_question()
            print(f"Question: {question}")
            return jsonify({"text": question, "type": "new"}), 200
        return jsonify({"text": result["question"], "type": "new"}), 200
    return jsonify(), 200


@app.route("/save", methods=["GET"])
def save_responses():
    assessment_system.save_responses()
    return jsonify({"status": "OK"}), 200


@app.route("/animate", methods=["POST"])
def animtion_from_audio():
    data = request.get_json()
    base64Audio = data["base64Audio"]
    audio_data = base64.b64decode(base64Audio)
    output_filename = "audio.wav"
    with open(output_filename, "wb") as wav_file:
        wav_file.write(audio_data)
    os.system("./Rhubarb_src/rhubarb audio.wav -r pocketSphinx -f json > audio.json")
    with open("audio.json", "r") as file:
        data = json.load(file)
    return jsonify(data["mouthCues"]), 200


app.run(debug=True)
# COMMENT TILL HERE TO RUN LOCALLY


# Run the assessment for all questions
while assessment_system.question_index < len(questions_data) - 1:
    run_assessment()

# Save responses to JSON file
assessment_system.save_responses()
