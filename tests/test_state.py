from services.state import SessionManager

def test_session_creation():
    manager = SessionManager()
    session_id = manager.create_session()
    assert session_id is not None
    assert manager.get_session(session_id) is not None
    assert manager.get_session(session_id)["skill_level"] == "beginner"

def test_session_update():
    manager = SessionManager()
    session_id = manager.create_session()
    
    manager.update_session(session_id, "signature_123", "User rotated panel")
    
    session = manager.get_session(session_id)
    assert session["thought_signature"] == "signature_123"
    assert "User rotated panel" in session["history"]
