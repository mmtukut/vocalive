#!/bin/bash
# Start Backend
echo "Starting Backend on Port 8000..."
cd backend
# Check if venv exists
if [ -d "venv" ]; then
    source venv/bin/activate
else
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
fi

python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Start Frontend
echo "Starting Frontend on Port 3000..."
cd ../frontend
# Ensure we use the local npm bin
npm install --legacy-peer-deps
npm run dev -- -p 3000 &
FRONTEND_PID=$!

echo "VocaLive running at http://localhost:3000"
echo "Backend running at http://localhost:8000"
echo "Press CTRL+C to stop."

trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait
