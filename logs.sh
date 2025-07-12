#!/bin/bash

# StackIt Server Logs Viewer
# Shows logs from running backend and frontend servers

echo "📋 StackIt Server Logs Viewer"
echo "============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Check server status
echo -e "${YELLOW}🔍 Checking server status...${NC}"

BACKEND_RUNNING=false
FRONTEND_RUNNING=false

if check_port 3001; then
    echo -e "${GREEN}✅ Backend server running on port 3001${NC}"
    BACKEND_RUNNING=true
else
    echo -e "${RED}❌ Backend server not running on port 3001${NC}"
fi

if check_port 5173; then
    echo -e "${GREEN}✅ Frontend server running on port 5173${NC}"
    FRONTEND_RUNNING=true
else
    echo -e "${RED}❌ Frontend server not running on port 5173${NC}"
fi

if [ "$BACKEND_RUNNING" = false ] && [ "$FRONTEND_RUNNING" = false ]; then
    echo -e "\n${RED}❌ No servers are running!${NC}"
    echo "Start the servers first with: ./dev.sh"
    exit 1
fi

echo ""

# Function to show backend logs
show_backend_logs() {
    echo -e "${BLUE}🔧 Backend Server Logs:${NC}"
    echo "======================="

    # Try to find the backend process and show its output
    BACKEND_PID=$(pgrep -f "node.*server.js")

    if [ -n "$BACKEND_PID" ]; then
        echo "Backend PID: $BACKEND_PID"
        echo "Monitoring backend server..."
        echo ""

        # Test backend API
        echo "Testing backend API..."
        curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
        echo ""
        echo "Backend API endpoints:"
        echo "• GET  /api/health"
        echo "• GET  /api/questions"
        echo "• GET  /api/notifications"
        echo "• POST /api/questions"
        echo ""

        # Show recent backend activity by making test requests
        echo "Recent backend activity:"
        echo "$(date): Health check - $(curl -s http://localhost:3001/api/health | jq -r .status 2>/dev/null || echo 'ok')"
        echo "$(date): Questions count - $(curl -s http://localhost:3001/api/questions | jq length 2>/dev/null || echo 'N/A')"
        echo "$(date): Notifications count - $(curl -s http://localhost:3001/api/notifications | jq length 2>/dev/null || echo 'N/A')"
    else
        echo "Cannot find backend process"
    fi
}

# Function to show frontend logs
show_frontend_logs() {
    echo -e "${BLUE}🎨 Frontend Server Logs:${NC}"
    echo "======================="

    FRONTEND_PID=$(pgrep -f "vite")

    if [ -n "$FRONTEND_PID" ]; then
        echo "Frontend PID: $FRONTEND_PID"
        echo "Monitoring frontend server..."
        echo ""

        # Test frontend
        echo "Testing frontend server..."
        FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
        if [ "$FRONTEND_STATUS" = "200" ]; then
            echo "✅ Frontend responding with status: $FRONTEND_STATUS"
        else
            echo "⚠️ Frontend status: $FRONTEND_STATUS"
        fi

        echo ""
        echo "Frontend info:"
        echo "• URL: http://localhost:5173"
        echo "• Hot reload: Enabled"
        echo "• Proxy: /api → http://localhost:3001"
        echo ""

        echo "Recent frontend activity:"
        echo "$(date): Server status - $FRONTEND_STATUS"
        echo "$(date): Vite dev server running"
    else
        echo "Cannot find frontend process"
    fi
}

# Function to monitor in real-time
monitor_servers() {
    echo -e "${YELLOW}📊 Real-time Server Monitor${NC}"
    echo "=========================="
    echo "Press Ctrl+C to stop monitoring"
    echo ""

    while true; do
        # Clear previous status (optional)
        # echo -e "\033[2J\033[H"

        TIMESTAMP=$(date '+%H:%M:%S')

        # Backend status
        if check_port 3001; then
            BACKEND_STATUS="${GREEN}✅ Running${NC}"
            API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)
            BACKEND_INFO="(API: $API_STATUS)"
        else
            BACKEND_STATUS="${RED}❌ Stopped${NC}"
            BACKEND_INFO=""
        fi

        # Frontend status
        if check_port 5173; then
            FRONTEND_STATUS="${GREEN}✅ Running${NC}"
            WEB_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
            FRONTEND_INFO="(HTTP: $WEB_STATUS)"
        else
            FRONTEND_STATUS="${RED}❌ Stopped${NC}"
            FRONTEND_INFO=""
        fi

        echo -e "$TIMESTAMP | Backend: $BACKEND_STATUS $BACKEND_INFO | Frontend: $FRONTEND_STATUS $FRONTEND_INFO"

        sleep 5
    done
}

# Function to test API endpoints
test_api() {
    echo -e "${YELLOW}🧪 Testing API Endpoints${NC}"
    echo "========================"

    if ! check_port 3001; then
        echo -e "${RED}❌ Backend server not running${NC}"
        return
    fi

    echo "Testing backend API endpoints..."
    echo ""

    # Health check
    echo -e "${BLUE}GET /api/health:${NC}"
    curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
    echo ""

    # Questions
    echo -e "${BLUE}GET /api/questions:${NC}"
    QUESTIONS=$(curl -s http://localhost:3001/api/questions)
    echo "$QUESTIONS" | jq 'length' 2>/dev/null && echo "questions found" || echo "Raw response: $QUESTIONS"
    echo ""

    # Notifications
    echo -e "${BLUE}GET /api/notifications:${NC}"
    NOTIFICATIONS=$(curl -s http://localhost:3001/api/notifications)
    echo "$NOTIFICATIONS" | jq 'length' 2>/dev/null && echo "notifications found" || echo "Raw response: $NOTIFICATIONS"
    echo ""

    # Unread count
    echo -e "${BLUE}GET /api/notifications/unread-count:${NC}"
    curl -s http://localhost:3001/api/notifications/unread-count | jq . 2>/dev/null || curl -s http://localhost:3001/api/notifications/unread-count
    echo ""

    # Tags
    echo -e "${BLUE}GET /api/tags:${NC}"
    TAGS=$(curl -s http://localhost:3001/api/tags)
    echo "$TAGS" | jq 'length' 2>/dev/null && echo "tags found" || echo "Raw response: $TAGS"
    echo ""
}

# Main menu
case "$1" in
    "backend")
        show_backend_logs
        ;;
    "frontend")
        show_frontend_logs
        ;;
    "monitor")
        monitor_servers
        ;;
    "test")
        test_api
        ;;
    "all")
        show_backend_logs
        echo ""
        show_frontend_logs
        ;;
    *)
        echo "Usage: $0 {backend|frontend|all|monitor|test}"
        echo ""
        echo "Commands:"
        echo "  backend   - Show backend server info and logs"
        echo "  frontend  - Show frontend server info and logs"
        echo "  all       - Show both backend and frontend info"
        echo "  monitor   - Real-time server status monitoring"
        echo "  test      - Test API endpoints"
        echo ""
        echo "Examples:"
        echo "  ./logs.sh all      # Show all server info"
        echo "  ./logs.sh monitor  # Monitor servers in real-time"
        echo "  ./logs.sh test     # Test backend API endpoints"
        echo ""

        # Auto-detect and show basic status
        echo -e "${YELLOW}Current server status:${NC}"
        if [ "$BACKEND_RUNNING" = true ]; then
            echo -e "• Backend: ${GREEN}Running${NC} on http://localhost:3001"
        fi
        if [ "$FRONTEND_RUNNING" = true ]; then
            echo -e "• Frontend: ${GREEN}Running${NC} on http://localhost:5173"
        fi

        if [ "$BACKEND_RUNNING" = true ] || [ "$FRONTEND_RUNNING" = true ]; then
            echo ""
            echo "Run './logs.sh monitor' to see real-time status"
            echo "Run './logs.sh test' to test API endpoints"
        fi
        ;;
esac
