from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from next_ques_agent.tools import FirebaseQuestionManager
from dotenv import load_dotenv
from next_ques_agent.agent import analyze_user_response
from progress_agent.agent import track_progress
import json

load_dotenv()  # Load environment variables from .env file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize Firebase Question Manager
question_manager = None


def initialize_question_manager():
    """Initialize the Firebase Question Manager with configuration"""
    global question_manager

    try:
        credentials_path = os.path.join(BASE_DIR, "credentials.json")
        questions_json_path = os.path.join(BASE_DIR, "questions.json")

        question_manager = FirebaseQuestionManager(
            credentials_path=credentials_path, questions_json_path=questions_json_path
        )

        logger.info("Firebase Question Manager initialized successfully")

    except Exception as e:
        logger.error(f"Failed to initialize Firebase Question Manager: {e}")
        raise


# Error handler for validation errors
class ValidationError(Exception):
    pass


@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"error": str(e)}), 400


@app.errorhandler(404)
def handle_not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


@app.errorhandler(500)
def handle_internal_error(e):
    logger.error(f"Internal server error: {e}")
    return jsonify({"error": "Internal server error"}), 500


# Utility function to validate user_id
def validate_user_id(user_id):
    if not user_id or not isinstance(user_id, str) or len(user_id.strip()) == 0:
        raise ValidationError("user_id is required and must be a non-empty string")
    return user_id.strip()


@app.route("/", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "Firebase Question Manager API",
            "version": "1.0.0",
        }
    )


@app.route("/track_progress", methods=["POST"])
async def track_progress_route():
    """
    Track user progress based on message history

    Expects JSON body with:
        user_id (str): User ID to track progress for

    Returns:
        JSON response with progress tracking result
    """
    try:
        # Validate request data
        data = request.get_json()
        if not data:
            raise ValidationError("Request body is required")

        user_id = data.get("user_id")
        user_id = validate_user_id(user_id)

        # Import track_progress function

        # Get message history from Firebase
        message_history = question_manager.getMessageHistory(user_id)

        if not message_history:
            return (
                jsonify(
                    {"success": False, "message": "No message history found for user"}
                ),
                404,
            )

        # Call track_progress function
        progress_result = await track_progress(user_id, message_history)
        if type(progress_result) is str:
            try:
                progress_result = json.loads(progress_result)
            except json.JSONDecodeError:
                progress_result = {"answered_questions": []}
        # Update progress field in Firebase
        question_manager.updateProgress(
            user_id, progress_result.get("answered_questions", []).__len__()
        )

        return jsonify(
            {
                "success": True,
                "data": {
                    "user_id": user_id,
                    "count": progress_result.get("answered_questions", []).__len__(),
                    "progress": progress_result,
                },
                "message": "Progress tracked and updated successfully",
            }
        )

    except ValidationError as e:
        raise e
    except Exception as e:
        logger.error(f"Error tracking progress for user {user_id}: {e}")
        return jsonify({"success": False, "error": "Failed to track progress"}), 500


@app.route("/api/questions/current/<user_id>", methods=["GET"])
def get_current_question(user_id):
    """
    Get current question for a user

    Args:
        user_id (str): User ID from URL path

    Returns:
        JSON response with current question or error
    """
    try:
        # Validate user_id
        user_id = validate_user_id(user_id)

        # Get current question
        current_question = question_manager.getCurrentQuestion(user_id)

        if current_question:
            return jsonify(
                {
                    "success": True,
                    "data": current_question,
                    "message": "Current question retrieved successfully",
                }
            )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "data": None,
                        "message": "No current question found for user",
                    }
                ),
                404,
            )

    except ValidationError as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting current question for user {user_id}: {e}")
        return (
            jsonify({"success": False, "error": "Failed to retrieve current question"}),
            500,
        )


@app.route("/api/questions/next/<user_id>", methods=["POST"])
async def get_next_question(user_id):
    """
    Get next question for a user and update their current question

    Args:
        user_id (str): User ID from URL path
        user_response (str): User's response to the current question (optional)
    Returns:
        JSON response with next question or error
    """
    try:
        # Validate user_id
        user_id = validate_user_id(user_id)
        user_response = (
            request.json.get("user_response", "").strip() if request.json else ""
        )
        current_question = question_manager.getCurrentQuestion(user_id)
        if not current_question:
            # Get next question
            next_question = question_manager.getNextQuestion(user_id)
        else:
            next_question = await analyze_user_response(user_id, user_response or "")

        if next_question:
            return jsonify(
                {
                    "success": True,
                    "data": next_question,
                    "message": "Next question retrieved and set successfully",
                }
            )
        else:
            return (
                jsonify(
                    {
                        "success": False,
                        "data": None,
                        "message": "No next question available or user not found",
                    }
                ),
                404,
            )

    except ValidationError as e:
        raise e
    except Exception as e:
        logger.error(f"Error getting next question for user {user_id}: {e}")
        return (
            jsonify({"success": False, "error": "Failed to retrieve next question"}),
            500,
        )


# Initialize the question manager when the app starts
@app.before_request
def startup():
    # The following line will remove this handler, making it
    # only run on the first request
    app.before_request_funcs[None].remove(startup)

    initialize_question_manager()


if __name__ == "__main__":
    # Initialize question manager
    initialize_question_manager()

    # Get configuration from environment variables
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "False").lower() == "true"

    logger.info(f"Starting Flask server on {host}:{port}")
    app.run(host=host, port=port, debug=debug)
