#!/bin/bash
echo "Starting VocaLive Tests..."

# Backend Tests
echo "Testing Backend..."
cd backend
python3 -m pytest ../tests/test_backend.py
if [ $? -eq 0 ]; then
    echo "✅ Backend Tests Passed"
else
    echo "❌ Backend Tests Failed"
fi

# Frontend Build Test
echo "Testing Frontend Build..."
cd ../frontend
npm run build
if [ $? -eq 0 ]; then
    echo "✅ Frontend Build Passed"
else
    echo "❌ Frontend Build Failed"
fi
