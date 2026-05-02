#!/bin/bash
echo "========================================"
echo " Smart City Platform - Starting..."
echo "========================================"

echo ""
echo "[1/2] Installing & starting Backend..."
cd backend
npm install
npm run dev &
BACKEND_PID=$!
cd ..

sleep 3

echo ""
echo "[2/2] Installing & starting Frontend..."
cd frontend
npm install
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo " Backend running on: http://localhost:5000"
echo " Frontend running on: http://localhost:3000"
echo " Press Ctrl+C to stop both"
echo "========================================"

wait $BACKEND_PID $FRONTEND_PID
