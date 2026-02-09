from fastapi.testclient import TestClient
from main import app
import sys
import os

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/backend")

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "VocaLive Backend: Online", "status": "ready"}

def test_websocket_connection():
    with client.websocket_connect("/ws") as websocket:
        # Check if we get the session created message (optional based on implementation)
        # or just try sending a frame
        
        # Test basic frame message
        websocket.send_json({
            "type": "frame",
            "image": "base64_placeholder_data" 
        })
        
        # Expect a feedback response
        # Note: Since Gemini is mocked or real, we might get an error or a mocked response.
        # This test ensures the websocket logic doesn't crash.
        data = websocket.receive_json()
        assert data is not None
        assert "feedback" in data or "type" in data
