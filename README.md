# VocaLive - Real-Time AI Vocational Coach

> **The "Duolingo for Hands-On Skills"** - Built for the Gemini 3 Hackathon.

VocaLive is a mobile-first Progressive Web App (PWA) that uses **Gemini 3 Pro's multimodal capabilities** to provide real-time, spatial, and spoken feedback to learners mastering trade skills (Solar Installation, Welding, Farming).

## 🚀 The Problem
500 million youth in emerging markets need jobs, but vocational training is expensive and inaccessible. **Video tutorials don't work** because skills are learned through eyes and hands, not screens. You need immediate correction ("Tilt left", "Move up") to learn.

## 💡 The Solution
VocaLive turns any smartphone into an expert coach.
- **Multimodal Vision**: Watches you work via camera.
- **Thought Signatures**: Remembers your previous mistakes and tracks progress over hours.
- **Spatial Audio**: "Rotate the panel 5 degrees clockwise" (in your native language).

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, PWA
- **Backend**: FastAPI (Python 3.11), WebSockets
- **AI**: Gemini 3 Pro (Multimodal Live API)
- **Infrastructure**: Google Cloud Run, Vercel

## 📦 Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- Gemini API Key

### 1. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
uvicorn main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Usage
1. Open `http://localhost:3000` (or your mobile IP for testing) on a phone.
2. Grant camera permissions.
3. Point camera at a task (e.g., holding a tool, soldering).
4. Receive real-time audio feedback.

## 🧠 Architecture
See `ARCHITECTURE.mermaid` for the full data flow.
- Video frames are captured at ~2FPS (configurable) and sent via WebSocket.
- Backend maintains `SessionManager` state.
- Gemini 3 Pro analyzes the image + session history + specialized prompts.
- Feedback is returned and spoken via Web Speech API.

## 📄 License
MIT
