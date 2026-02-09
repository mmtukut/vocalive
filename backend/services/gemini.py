import os
import google.generativeai as genai
from dotenv import load_dotenv
import base64
import json
import logging
from prompts.solar import SOLAR_INSTALLATION_PROMPT

load_dotenv()
logger = logging.getLogger("vocalive")

class GeminiService:
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            logger.warning("GEMINI_API_KEY not found")
        else:
            genai.configure(api_key=self.api_key)
            # Use a model that supports JSON mode if possible, or robust parsing
            self.model = genai.GenerativeModel('gemini-3-flash-preview', 
                generation_config={"response_mime_type": "application/json"})

    async def process_frame(self, base64_image, session_data):
        if not self.api_key:
            return {"feedback_text": "API Key missing", "is_correct": False}, None

        try:
            image_bytes = base64.b64decode(base64_image)
            
            # Contextualize prompt
            prompt = SOLAR_INSTALLATION_PROMPT.format(
                language=session_data.get("language", "en"),
                skill_level=session_data.get("skill_level", "beginner"),
                history_summary=str(session_data.get("history")[-3:]), # Last 3 actions
                current_task="Installing roof mount" # Dynamic in real app
            )

            # Add previous thought signature if exists to maintain chain of thought
            if session_data.get("thought_signature"):
                 prompt += f"\nPREVIOUS THOUGHT SIGNATURE: {session_data.get('thought_signature')}"

            response = self.model.generate_content([prompt, {"mime_type": "image/jpeg", "data": image_bytes}])
            
            # Parse JSON response
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
            return {"feedback_text": f"Connection error: {error_msg[:20]}...", "is_correct": False}, None

gemini_service = GeminiService()
