from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import logging
import json
from services.gemini import gemini_service
from services.state import session_manager
from prompts import SKILLS

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


@app.get("/api/skills")
async def get_skills():
    """Return available skills for the frontend."""
    skills_list = []
    for skill_id, skill in SKILLS.items():
        skills_list.append({
            "id": skill_id,
            "name": skill["name"],
            "name_ha": skill["name_ha"],
            "icon": skill["icon"],
            "color": skill["color"],
        })
    return JSONResponse(content={"skills": skills_list})


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, client_id: str = Query(None)):
    await websocket.accept()

    # Create or retrieve session
    if not client_id:
        session_id = session_manager.create_session()
        await websocket.send_json({"type": "session_created", "session_id": session_id})
    else:
        session_id = client_id
        if not session_manager.get_session(session_id):
            session_id = session_manager.create_session()

    logger.info(f"Client connected: {session_id}")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            msg_type = message.get("type")

            if msg_type == "select_skill":
                skill_id = message.get("skill_id", "solar")
                session_manager.set_skill(session_id, skill_id)
                skill_info = SKILLS.get(skill_id, SKILLS["solar"])
                await websocket.send_json({
                    "type": "skill_selected",
                    "skill_id": skill_id,
                    "skill_name": skill_info["name"],
                    "skill_name_ha": skill_info["name_ha"],
                })
                logger.info(f"Skill set to: {skill_id}")

            elif msg_type == "set_language":
                language = message.get("language", "en")
                session_manager.set_language(session_id, language)
                await websocket.send_json({
                    "type": "language_set",
                    "language": language,
                })
                logger.info(f"Language set to: {language}")

            elif msg_type == "frame":
                image_data = message.get("image")
                user_question = message.get("question")  # Optional question with frame
                session_data = session_manager.get_session(session_id)

                result, new_signature = await gemini_service.process_frame(
                    image_data, session_data, user_question
                )

                if new_signature:
                    session_manager.update_session(
                        session_id, new_signature, result.get("feedback_text", "")
                    )

                await websocket.send_json({
                    "type": "feedback",
                    "feedback": result.get("feedback_text"),
                    "is_correct": result.get("is_correct", True),
                    "visual_cue": result.get("visual_cue"),
                })

            elif msg_type == "user_message":
                question = message.get("text", "")
                session_data = session_manager.get_session(session_id)
                result = await gemini_service.answer_question(question, session_data)
                await websocket.send_json({
                    "type": "feedback",
                    "feedback": result.get("feedback_text"),
                    "is_correct": True,
                })

    except WebSocketDisconnect:
        logger.info(f"Client disconnected: {session_id}")
    except Exception as e:
        logger.error(f"Error in WebSocket loop: {e}")
        try:
            await websocket.close()
        except:
            pass


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
