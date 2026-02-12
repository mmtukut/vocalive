import uuid
from typing import Dict, Optional


class SessionManager:
    def __init__(self):
        self._sessions: Dict[str, Dict] = {}

    def create_session(self, skill_id: str = "solar", language: str = "en") -> str:
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = {
            "history": [],
            "thought_signature": None,
            "skill_level": "beginner",
            "skill_id": skill_id,
            "language": language,
            "current_task": "",
        }
        return session_id

    def get_session(self, session_id: str) -> Optional[Dict]:
        return self._sessions.get(session_id)

    def update_session(self, session_id: str, thought_signature: str, last_action: str):
        if session_id in self._sessions:
            self._sessions[session_id]["thought_signature"] = thought_signature
            self._sessions[session_id]["history"].append(last_action)
            # Keep history manageable
            if len(self._sessions[session_id]["history"]) > 20:
                self._sessions[session_id]["history"] = self._sessions[session_id]["history"][-10:]

    def set_skill(self, session_id: str, skill_id: str):
        if session_id in self._sessions:
            self._sessions[session_id]["skill_id"] = skill_id
            self._sessions[session_id]["thought_signature"] = None  # Reset context for new skill
            self._sessions[session_id]["history"] = []

    def set_language(self, session_id: str, language: str):
        if session_id in self._sessions:
            self._sessions[session_id]["language"] = language

    def set_task(self, session_id: str, task: str):
        if session_id in self._sessions:
            self._sessions[session_id]["current_task"] = task


session_manager = SessionManager()
