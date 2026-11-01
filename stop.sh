#!/bin/bash

# Task Manager - Stop Script
# Stops frontend (4000/4002), backend (4001), and Ollama.

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Stop processes on known ports
stop_ports() {
    local PORTS=("4000" "4001" "4002")
    for port in "${PORTS[@]}"; do
        if lsof -ti:${port} >/dev/null 2>&1; then
            print_status "Stopping process on port ${port}"
            lsof -ti:${port} | xargs -r kill -9 2>/dev/null || true
        fi
    enddone
}

# Stop Ollama if running
stop_ollama() {
    if pgrep -x "ollama" >/dev/null 2>&1; then
        print_status "Stopping Ollama"
        pkill -x ollama || true
    else
        print_warning "Ollama not running"
    fi
}

stop_ports
stop_ollama

print_status "All services stopped."
