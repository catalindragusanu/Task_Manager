#!/bin/bash

# Task Manager - Auto Start Script
# Starts Ollama, Backend (port 4001), and Frontend (port 4000)

set -e  # Exit on error

# Color codes for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to cleanup background processes on exit
cleanup() {
    print_warning "Shutting down services..."

    # Kill background jobs
    jobs -p | xargs -r kill 2>/dev/null || true

    # Kill processes on our ports
    lsof -ti:4000 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:4001 | xargs -r kill -9 2>/dev/null || true
    lsof -ti:4002 | xargs -r kill -9 2>/dev/null || true

    print_status "Services stopped"
    exit 0
}

# Trap SIGINT (Ctrl+C) and SIGTERM
trap cleanup SIGINT SIGTERM

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    print_error "Ollama is not installed. Please install it first."
    exit 1
fi

# Check if Python venv exists
if [ ! -d "backend/venv" ]; then
    print_error "Backend virtual environment not found at backend/venv"
    print_warning "Please run: cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "frontend/node_modules" ]; then
    print_error "Frontend dependencies not installed"
    print_warning "Please run: cd frontend && npm install"
    exit 1
fi

print_status "Starting Task Manager Application..."
echo ""

# Start Ollama
print_status "Starting Ollama AI service..."
if pgrep -x "ollama" > /dev/null; then
    print_warning "Ollama is already running"
else
    ollama serve > /dev/null 2>&1 &
    sleep 2
    if pgrep -x "ollama" > /dev/null; then
        print_status "✓ Ollama started (PID: $(pgrep -x ollama))"
    else
        print_error "Failed to start Ollama"
        exit 1
    fi
fi

# Verify llama3.2 model is installed
if ! ollama list | grep -q "llama3.2"; then
    print_warning "Model llama3.2:latest not found. Installing..."
    ollama pull llama3.2:latest
fi

echo ""

# Start Backend
print_status "Starting Backend API (port 4001)..."
cd backend
source venv/bin/activate
python run.py > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
sleep 3

# Check if backend started successfully
if lsof -ti:4001 > /dev/null 2>&1; then
    print_status "✓ Backend started (PID: $BACKEND_PID, port 4001)"
else
    print_error "Failed to start backend on port 4001"
    cat logs/backend.log
    cleanup
    exit 1
fi

echo ""

# Start Frontend
print_status "Starting Frontend (port 4000)..."
cd frontend
PORT=4000 npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for frontend to start
print_status "Waiting for frontend to start..."
for i in {1..30}; do
    if lsof -ti:4000 > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

if lsof -ti:4000 > /dev/null 2>&1; then
    print_status "✓ Frontend started (PID: $FRONTEND_PID, port 4000)"
else
    print_error "Failed to start frontend on port 4000"
    cat logs/frontend.log
    cleanup
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Task Manager is Ready!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "  Frontend:  ${YELLOW}http://localhost:4000${NC}"
echo -e "  Backend:   ${YELLOW}http://localhost:4001${NC}"
echo -e "  Ollama:    ${YELLOW}http://localhost:11434${NC}"
echo ""
echo -e "Logs are in the ${YELLOW}logs/${NC} directory"
echo -e "Press ${RED}Ctrl+C${NC} to stop all services"
echo ""

# Wait for user interrupt
wait
