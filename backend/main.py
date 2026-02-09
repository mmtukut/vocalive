from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import logging
import json
import asyncio
from services.gemini import gemini_service
from services.state import session_manager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vocalive")

app = FastAPI(title="VocaLive Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "VocaLive Backend: Online", "status": "ready"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, client_id: str = Query(None)):
    await websocket.accept()
    
    # Create or retrieve session
    if not client_id:
        session_id = session_manager.create_session()
        # Inform client of new session ID
        await websocket.send_json({"type": "session_created", "session_id": session_id})
    else:
        session_id = client_id
        if not session_manager.get_session(session_id):
             session_id = session_manager.create_session() # Fallback
    
    logger.info(f"Client connected: {session_id}")
    
    try:
        while True:
            # Receive data from client
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message.get("type") == "frame":
                # Extract image data (base64)
                image_data = message.get("image")
                
                # Get current state
                session_data = session_manager.get_session(session_id)
                
                # Process with Gemini
                result, new_signature = await gemini_service.process_frame(image_data, session_data)
                
                # Update state
                if new_signature:
                    session_manager.update_session(session_id, new_signature, result.get("feedback_text", ""))
                
                # Send feedback
                await websocket.send_json({
                    "type": "feedback",
                    "feedback": result.get("feedback_text"),
                    "visual_cue": result.get("visual_cue")
                })
                
    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.error(f"Error in WebSocket loop: {e}")
        try:
            await websocket.close()
        except:
            pass

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
