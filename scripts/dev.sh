#!/bin/bash

# Healthcare AI Suite Development Script
echo "🚀 Starting Healthcare AI Suite..."

# Start all services concurrently
echo "📱 Starting Web App (React)..."
cd apps/web && npm run dev &

echo "🔗 Starting API Gateway (Node.js)..."
cd apps/api-gateway && npm run dev &

echo "🧠 Starting ML Service (Python - Port 8000)..."
cd apps/ml-service && uvicorn server:app --reload --port 8000 &

echo "💊 Starting DDI Service (Python - Port 9000)..."
cd apps/ddi-service && uvicorn server2:app --reload --port 9000 &

echo "✅ All services started!"
echo "🌐 Web: http://localhost:5173"
echo "🔗 API: http://localhost:3000"
echo "🧠 ML: http://localhost:8000"
echo "💊 DDI: http://localhost:9000"

wait