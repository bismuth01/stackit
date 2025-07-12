#!/bin/bash

# Simple StackIt Development Script
# Better logging and easier debugging

echo "🚀 StackIt Development Environment"
echo "=================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Run this script from the stackit root directory${NC}"
    exit 1
fi

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Cleanup function
cleanup() {
    echo -e "\n${YELLOW}🧹 Stopping servers...${NC}"

    # Kill background jobs
    jobs -p | xargs kill 2>/dev/null || true

    # Kill by port
    if check_port 3001; then
        lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    fi

    if check_port 5173; then
        lsof -ti:5173 | xargs kill -9 2>/dev/null || true
    fi

    echo -e "${GREEN}✅ Servers stopped${NC}"
    exit 0
}

# Handle Ctrl+C
trap cleanup SIGINT SIGTERM

# Kill any existing servers
echo -e "${YELLOW}🔍 Checking for existing servers...${NC}"
cleanup 2>/dev/null

sleep 1

# Start backend
echo -e "\n${BLUE}🔧 Starting Backend Server...${NC}"
cd backend/simple-server

if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

echo "Starting backend on port 3001..."
node server.js &
BACKEND_PID=$!

# Wait for backend
echo "Waiting for backend to start..."
for i in {1..15}; do
    if curl -s http://localhost:3001/api/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend ready at http://localhost:3001${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        exit 1
    fi
    sleep 1
done

cd ../..

# Start frontend
echo -e "\n${BLUE}🎨 Starting Frontend Server...${NC}"
cd frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

echo "Starting frontend on port 5173..."
npm run dev &
FRONTEND_PID=$!

# Wait for frontend
echo "Waiting for frontend to start..."
for i in {1..15}; do
    if curl -s http://localhost:5173 > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Frontend ready at http://localhost:5173${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}❌ Frontend failed to start${NC}"
        exit 1
    fi
    sleep 1
done

cd ..

# Show status
echo -e "\n${GREEN}🎉 Both servers are running!${NC}"
echo "=============================="
echo -e "${BLUE}Frontend:${NC} http://localhost:5173"
echo -e "${BLUE}Backend:${NC}  http://localhost:3001"
echo -e "${BLUE}API:${NC}      http://localhost:3001/api/health"
echo ""

# Test API connection
echo -e "${YELLOW}🔍 Testing API connection...${NC}"
if curl -s http://localhost:3001/api/health | grep -q "ok"; then
    echo -e "${GREEN}✅ API is responding correctly${NC}"
else
    echo -e "${RED}⚠️ API test failed${NC}"
fi

echo ""
echo -e "${YELLOW}📋 Quick Commands:${NC}"
echo "• Test API:     curl http://localhost:3001/api/health"
echo "• Get Questions: curl http://localhost:3001/api/questions"
echo "• Get Notifications: curl http://localhost:3001/api/notifications"
echo ""
echo -e "${YELLOW}💡 Tips:${NC}"
echo "• Both servers auto-reload on file changes"
echo "• Check browser console for any errors"
echo "• Frontend will fallback to mock data if backend fails"
echo ""
echo -e "${GREEN}Press Ctrl+C to stop both servers${NC}"

# Keep script running and show minimal logs
echo -e "\n${BLUE}📊 Server Status Monitor:${NC}"
echo "========================="

while true; do
    sleep 10

    # Check backend
    if check_port 3001; then
        BACKEND_STATUS="${GREEN}✅${NC}"
    else
        BACKEND_STATUS="${RED}❌${NC}"
    fi

    # Check frontend
    if check_port 5173; then
        FRONTEND_STATUS="${GREEN}✅${NC}"
    else
        FRONTEND_STATUS="${RED}❌${NC}"
    fi

    # Show status
    echo -e "$(date '+%H:%M:%S') - Backend: $BACKEND_STATUS Frontend: $FRONTEND_STATUS"
done
