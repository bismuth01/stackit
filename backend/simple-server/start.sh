#!/bin/bash

# StackIt Simple Server Startup Script
echo "🚀 StackIt Simple Server Startup Script"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the simple-server directory"
    echo "   cd stackit/backend/simple-server"
    exit 1
fi

# Function to check if server is running
check_server() {
    curl -s http://localhost:3001/api/health > /dev/null 2>&1
    return $?
}

# Function to start server
start_server() {
    echo "📦 Installing dependencies..."
    npm install

    echo "🔥 Starting server..."
    node server.js &
    SERVER_PID=$!
    echo "Server PID: $SERVER_PID"

    # Wait for server to start
    echo "⏳ Waiting for server to start..."
    for i in {1..10}; do
        if check_server; then
            echo "✅ Server is running on http://localhost:3001"
            return 0
        fi
        sleep 1
    done

    echo "❌ Server failed to start"
    return 1
}

# Function to stop server
stop_server() {
    echo "🛑 Stopping server..."
    pkill -f "node server.js"
    echo "✅ Server stopped"
}

# Function to run demo
run_demo() {
    echo "🎬 Running demo..."
    node demo.js
}

# Function to run tests
run_tests() {
    echo "🧪 Running tests..."
    node test.js
}

# Main menu
case "$1" in
    "start")
        if check_server; then
            echo "✅ Server is already running on http://localhost:3001"
        else
            start_server
        fi
        ;;
    "stop")
        stop_server
        ;;
    "restart")
        stop_server
        sleep 2
        start_server
        ;;
    "demo")
        if check_server; then
            run_demo
        else
            echo "❌ Server is not running. Start it first with: ./start.sh start"
        fi
        ;;
    "test")
        if check_server; then
            run_tests
        else
            echo "❌ Server is not running. Start it first with: ./start.sh start"
        fi
        ;;
    "status")
        if check_server; then
            echo "✅ Server is running on http://localhost:3001"
            curl -s http://localhost:3001/api/health | jq . 2>/dev/null || curl -s http://localhost:3001/api/health
        else
            echo "❌ Server is not running"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|demo|test|status}"
        echo ""
        echo "Commands:"
        echo "  start   - Start the server"
        echo "  stop    - Stop the server"
        echo "  restart - Restart the server"
        echo "  demo    - Show sample API responses"
        echo "  test    - Run API tests"
        echo "  status  - Check server status"
        echo ""
        echo "Quick start:"
        echo "  ./start.sh start"
        echo "  ./start.sh demo"
        echo ""
        exit 1
        ;;
esac
