import uuid
from typing import Dict, Optional

class SessionManager:
    def __init__(self):
        # In-memory storage for prototype. Replace with Redis for production.
        self._sessions: Dict[str, Dict] = {}

    def create_session(self) -> str:
        session_id = str(uuid.uuid4())
        self._sessions[session_id] = {
            "history": [],
            "thought_signature": None,
            "skill_level": "beginner",
            "language": "en"
        }
        return session_id

    def get_session(self, session_id: str) -> Optional[Dict]:
        return self._sessions.get(session_id)

    def update_session(self, session_id: str, thought_signature: str, last_action: str):
        if session_id in self._sessions:
            self._sessions[session_id]["thought_signature"] = thought_signature
            self._sessions[session_id]["history"].append(last_action)

    def set_language(self, session_id: str, language: str):
         if session_id in self._sessions:
            self._sessions[session_id]["language"] = language

session_manager = SessionManager()
