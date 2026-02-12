import os
import google.generativeai as genai
from dotenv import load_dotenv
import base64
import json
import logging
from prompts import get_prompt

load_dotenv()
logger = logging.getLogger("vocalive")


class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found")
        else:
            genai.configure(api_key=self.api_key)
            self.model = genai.GenerativeModel(
                "gemini-3-flash-preview",
                generation_config={"response_mime_type": "application/json"},
            )

    async def process_frame(self, base64_image: str, session_data: dict, user_question: str = None):
        """Process a camera frame with the appropriate skill prompt."""
        if not self.api_key:
            return {"feedback_text": "API Key missing", "is_correct": False}, None

        try:
            image_bytes = base64.b64decode(base64_image)

            # Build prompt from skill registry
            prompt = get_prompt(
                skill_id=session_data.get("skill_id", "solar"),
                language=session_data.get("language", "en"),
                skill_level=session_data.get("skill_level", "beginner"),
                history_summary=str(session_data.get("history", [])[-3:]),
                current_task=session_data.get("current_task", ""),
                user_question=user_question,
            )

            # Chain of thought continuity
            if session_data.get("thought_signature"):
                prompt += f"\nPREVIOUS THOUGHT SIGNATURE: {session_data['thought_signature']}"

            response = self.model.generate_content(
                [prompt, {"mime_type": "image/jpeg", "data": image_bytes}]
            )

            try:
                result = json.loads(response.text)
                new_signature = result.get("thought_signature", "continued")
                return result, new_signature
            except json.JSONDecodeError:
                logger.error("Failed to parse JSON from Gemini")
                return {"feedback_text": "Hold on, I'm analyzing...", "is_correct": True}, None

        except Exception as e:
            logger.error(f"Gemini API Error: {e}")
            error_msg = str(e)
            if "429" in error_msg:
                return {"feedback_text": "Traffic limit reached. Please wait a moment.", "is_correct": False}, None
            return {"feedback_text": f"Connection error", "is_correct": False}, None

    async def answer_question(self, question: str, session_data: dict):
        """Answer a text-only question about the current skill (no image)."""
        if not self.api_key:
            return {"feedback_text": "API Key missing"}

        try:
            skill_id = session_data.get("skill_id", "solar")
            language = session_data.get("language", "en")
            
            lang_note = "Respond in Hausa (Harshen Hausa)." if language == "ha" else "Respond in simple English."

            prompt = f"""You are VocaLive, an expert {skill_id} coach.
A student asks: "{question}"

{lang_note}
Give a brief, practical answer (2-3 sentences max). Be encouraging.

OUTPUT FORMAT (JSON):
{{"feedback_text": "Your answer here"}}
"""
            response = self.model.generate_content(prompt)
            result = json.loads(response.text)
            return result
        except Exception as e:
            logger.error(f"Question error: {e}")
            return {"feedback_text": "I didn't catch that. Can you ask again?"}


gemini_service = GeminiService()
