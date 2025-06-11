import json
import firebase_admin
from firebase_admin import credentials, firestore
from typing import Dict, Optional, Any
from encryption import decrypt
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


class FirebaseQuestionManager:

    def __init__(self, credentials_path: str = None, questions_json_path: str = None):

        if not firebase_admin._apps:
            if credentials_path:
                cred = credentials.Certificate(credentials_path)
                firebase_admin.initialize_app(cred)
            else:
                firebase_admin.initialize_app()

        self.db = firestore.client()
        self.questions_data = {}

        if questions_json_path:
            self.load_questions(questions_json_path)

    def updateProgress(self, userId: str, progress: int) -> bool:
        """
        Updates the progress field for a user in Firebase.

        Args:
            userId (str): The ID of the user whose progress to update
            progress (int): The progress data to update

        Returns:
            bool: True if successful, False otherwise
        """
        try:
            user_ref = self.db.collection("users").document(userId)
            user_ref.update({"progress": progress})
            print(f"Updated progress for user {userId}")
            return True
        except Exception as e:
            print(f"Error updating progress for user {userId}: {e}")
            return False

    def getMessageHistory(self, userId: str) -> Optional[list]:
        """
        Gets the message history for a user from Firebase, decrypting messages if necessary.

        Args:
            userId (str): The ID of the user whose message history to retrieve

        Returns:
            Optional[list]: The user's decrypted message history or None if not found
        """
        try:
            user_ref = self.db.collection("users").document(userId)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                user_history = user_data.get("userHistory", [])
                user_email = user_data.get("email")

                if not user_email:
                    print(f"User email not found for user {userId} - required for decryption")

                if not user_history:
                    return []

                if not user_email:
                    print(f"Warning: Email not found for user {userId}. Encrypted messages will not be decrypted.")
                    return user_history


                decrypted_user_history = []
                for entry in user_history:
                    if isinstance(entry, dict):
                        decrypted_entry = {}
                        for key, value in entry.items():
                            if key == 'encryptedMessage' and value and user_email:
                                try:
                                    decrypted_message = decrypt(value, user_email)
                                    decrypted_entry['message'] = decrypted_message
                                except Exception as e:
                                    print(f"Failed to decrypt message for user {userId}: {e}")
                                    decrypted_entry['message'] = "[ENCRYPTED_DATA_COULD_NOT_DECRYPT]"
                            else:
                                decrypted_entry[key] = value
                                
                        decrypted_user_history.append(decrypted_entry)
                    else:
                        decrypted_user_history.append(entry)

                return decrypted_user_history

            return None

        except Exception as e:
            print(f"Error getting message history for user {userId}: {e}")
            return None

    def load_questions(self, questions_json_path: str) -> None:

        try:
            with open(questions_json_path, "r", encoding="utf-8") as file:
                self.questions_data = json.load(file)
            print(f"Loaded questions from {questions_json_path}")
        except FileNotFoundError:
            print(f"Questions file not found: {questions_json_path}")
        except json.JSONDecodeError as e:
            print(f"Error parsing questions JSON: {e}")

    def set_questions_data(self, questions_dict: Dict[str, list]) -> None:

        self.questions_data = questions_dict

    def getCurrentQuestion(self, userId: str) -> Optional[Dict[str, Any]]:

        try:
            # Get user document from Firebase
            user_ref = self.db.collection("users").document(userId)
            user_doc = user_ref.get()

            if user_doc.exists:
                user_data = user_doc.to_dict()
                current_question = user_data.get("currentQuestion")

                if current_question:
                    return {
                        "questionTheme": current_question.get("questionTheme"),
                        "questionIndex": current_question.get("questionIndex"),
                        "questionText": current_question.get("questionText"),
                    }

            return None

        except Exception as e:
            print(f"Error getting current question for user {userId}: {e}")
            return None

    def getNextQuestion(self, userId: str) -> Dict[str, Any]:

        try:
            # First get current question
            current_question = self.getCurrentQuestion(userId)
            themes = list(self.questions_data.keys())
            if not current_question:
                # set next theme.
                current_theme = themes[0]
                current_index = -1
            else:
                current_theme = current_question["questionTheme"]
                current_index = current_question["questionIndex"]

            # Check if theme exists in questions data
            if current_theme not in self.questions_data:
                print(f"Theme '{current_theme}' not found in questions data")
                return {}

            theme_questions = self.questions_data[current_theme]
            next_index = current_index + 1

            # Check if next question exists
            if next_index >= len(theme_questions):
                # If no more questions in current theme, move to next theme
                current_theme_index = themes.index(current_theme)
                if current_theme_index + 1 < len(themes):
                    current_theme = themes[current_theme_index + 1]
                    next_index = 0
                else:
                    print(f"All questions done for user {userId}")
                    return {}
            # Get next question
            next_question_data = theme_questions[next_index]
            next_question = {
                "questionTheme": current_theme,
                "questionIndex": next_index,
                "questionText": next_question_data.get("question", ""),
            }

            # Update Firebase with new current question
            user_ref = self.db.collection("users").document(userId)
            user_ref.update({"currentQuestion": next_question})

            print(
                f"Updated user {userId} to question {next_index} in theme '{current_theme}'"
            )
            return next_question["questionText"]

        except Exception as e:
            print(f"Error getting next question for user {userId}: {e}")
            return None

    def setCurrentQuestion(
        self, userId: str, questionTheme: str, questionIndex: int = 0
    ) -> Optional[Dict[str, Any]]:

        try:
            if questionTheme not in self.questions_data:
                print(f"Theme '{questionTheme}' not found in questions data")
                return None

            theme_questions = self.questions_data[questionTheme]

            if questionIndex >= len(theme_questions):
                print(
                    f"Question index {questionIndex} out of range for theme '{questionTheme}'"
                )
                return None

            question_data = theme_questions[questionIndex]
            current_question = {
                "questionTheme": questionTheme,
                "questionIndex": questionIndex,
                "questionText": question_data.get("questionText", ""),
            }

            # Update Firebase
            user_ref = self.db.collection("users").document(userId)
            user_ref.set({"currentQuestion": current_question}, merge=True)

            print(
                f"Set current question for user {userId}: theme '{questionTheme}', index {questionIndex}"
            )
            return current_question

        except Exception as e:
            print(f"Error setting current question for user {userId}: {e}")
            return None


credentials_path = os.path.join(BASE_DIR, "credentials.json")
questions_json_path = os.path.join(BASE_DIR, "questions.json")
question_manager = FirebaseQuestionManager(
    credentials_path=credentials_path,
    questions_json_path=questions_json_path,
)


def get_next_question(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Gets the next question for a user based on their current question state.
    @PARAMS:
    userId (str): The ID of the user for whom to get the next question.
    Returns:
    Dict[str, Any]: The next question data or empty dict if no more questions are available.
    """
    print("Going to get next question for user:", user_id)
    return question_manager.getNextQuestion(user_id)


def get_current_question(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Gets the current question for a user.
    @PARAMS:
    userId (str): The ID of the user for whom to get the current question.
    Returns:
    Dict[str, Any]: The current question data or empty dict if no current question is set.
    """

    return question_manager.getCurrentQuestion(user_id)
