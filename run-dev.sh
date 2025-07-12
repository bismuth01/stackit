#!/bin/bash

# StackIt Development Setup Script
# Runs both frontend and backend for development

echo "🚀 Starting StackIt Development Environment"
echo "==========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Run this script from the stackit root directory${NC}"
    echo "Expected structure:"
    echo "  stackit/"
    echo "    ├── backend/"
    echo "    ├── frontend/"
    echo "    └── run-dev.sh"
    exit 1
fi

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Function to kill processes on specific ports
cleanup() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"

    # Kill backend server on port 3001
    if check_port 3001; then
        echo "Stopping backend server (port 3001)..."
        pkill -f "node.*server.js" 2>/dev/null || true
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    fi

    # Kill frontend server on port 5173
    if check_port 5173; then
        echo "Stopping frontend server (port 5173)..."
        pkill -f "vite" 2>/dev/null || true
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    fi

    echo -e "${GREEN}✅ Cleanup complete${NC}"
}

# Handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Function to start backend
start_backend() {
    echo -e "\n${BLUE}📦 Setting up Backend...${NC}"

    cd backend/simple-server

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing backend dependencies..."
        npm install
    fi

    echo "Starting backend server..."
    node server.js > ../backend.log 2>&1 &
    BACKEND_PID=$!

    # Wait for backend to start
    echo "Waiting for backend server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Backend server running on http://localhost:3001${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Backend server failed to start${NC}"
            exit 1
        fi
        sleep 1
    done

    cd ../..
}

# Function to start frontend
start_frontend() {
    echo -e "\n${BLUE}🎨 Setting up Frontend...${NC}"

    cd frontend

    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi

    echo "Starting frontend development server..."
    npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!

    # Wait for frontend to start
    echo "Waiting for frontend server to start..."
    for i in {1..30}; do
        if curl -s http://localhost:5173 > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Frontend server running on http://localhost:5173${NC}"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Frontend server failed to start${NC}"
            exit 1
        fi
        sleep 1
    done

    cd ..
}

# Main execution
echo -e "${YELLOW}🔍 Checking for existing servers...${NC}"

# Kill any existing servers
cleanup
sleep 2

# Start backend
start_backend

# Start frontend
start_frontend

# Show status
echo -e "\n${GREEN}🎉 StackIt Development Environment Ready!${NC}"
echo "==========================================="
echo -e "${BLUE}📱 Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}🔧 Backend API:${NC} http://localhost:3001"
echo -e "${BLUE}📊 API Health:${NC} http://localhost:3001/api/health"
echo ""
echo -e "${YELLOW}Available API Endpoints:${NC}"
echo "  GET    /api/questions          - Get all questions"
echo "  POST   /api/questions          - Create question"
echo "  GET    /api/questions/:id      - Get single question"
echo "  GET    /api/notifications      - Get notifications"
echo "  GET    /api/tags               - Get tags"
echo "  GET    /api/search?q=term      - Search questions"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "  • Frontend will auto-reload on changes"
echo "  • Backend serves data in the exact format your frontend needs"
echo "  • If backend is unavailable, frontend falls back to mock data"
echo "  • Use Ctrl+C to stop both servers"
echo ""
echo -e "${GREEN}🏗️  Start building your UI - the backend is ready!${NC}"

# Keep script running and show logs
echo -e "\n${BLUE}📋 Server Logs (Ctrl+C to stop):${NC}"
echo "================================================"

# Function to show logs
show_logs() {
    echo -e "${YELLOW}Backend Server Logs:${NC}"
    echo "--------------------"
    tail -f backend.log &
    BACKEND_LOG_PID=$!

    echo -e "\n${YELLOW}Frontend Server Logs:${NC}"
    echo "---------------------"
    tail -f frontend.log &
    FRONTEND_LOG_PID=$!

    # Wait for user to stop
    wait
}

# Enhanced cleanup function
cleanup_with_logs() {
    echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"

    # Kill log tail processes
    kill $BACKEND_LOG_PID $FRONTEND_LOG_PID 2>/dev/null || true

    # Kill backend server on port 3001
    if check_port 3001; then
        echo "Stopping backend server (port 3001)..."
        pkill -f "node.*server.js" 2>/dev/null || true
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    fi

    # Kill frontend server on port 5173
    if check_port 5173; then
        echo "Stopping frontend server (port 5173)..."
        pkill -f "vite" 2>/dev/null || true
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    fi

    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Override trap to use new cleanup
trap cleanup_with_logs SIGINT SIGTERM

# Show logs
show_logs
