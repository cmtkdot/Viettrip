#!/bin/bash

set -e

# Function to check the last command's exit status
check_status() {
    if [ $? -ne 0 ]; then
        echo "Error: $1 failed"
        exit 1
    fi
}

# Install Node.js
echo "Installing Node.js..."
if ! command -v node &> /dev/null; then
    echo "Node.js not found. Installing..."
    curl -fsSL https://deb.nodesource.com/setup_14.x | sudo -E bash -
    sudo apt-get install -y nodejs
    check_status "Node.js installation"
else
    echo "Node.js is already installed."
fi

# Verify Node.js installation
echo "Verifying Node.js installation..."
node --version
npm --version
check_status "Node.js version check"

# Set NODE_PATH
export NODE_PATH=/usr/lib/node_modules
echo "NODE_PATH set to $NODE_PATH"

# Kill existing processes on ports 3000 and 5001
echo "Killing existing processes on ports 3000 and 5001..."
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
lsof -ti:5001 | xargs kill -9 2>/dev/null || true

# Install dependencies
echo "Installing npm dependencies..."
npm install
check_status "npm install"

echo "Installing Python dependencies..."
pip install -r requirements.txt
check_status "pip install"

# Build Next.js app
echo "Building Next.js app..."
npm run build
check_status "npm run build"

# Start Flask backend
echo "Starting Flask backend..."
python main.py > flask.log 2>&1 &
FLASK_PID=$!

# Wait for Flask to start
sleep 5

# Check if Flask is running
if ! ps -p $FLASK_PID > /dev/null; then
    echo "Error: Flask failed to start. Check flask.log for details."
    exit 1
fi

# Start Next.js frontend
echo "Starting Next.js frontend..."
npm run dev > nextjs.log 2>&1 &
NEXT_PID=$!

# Wait for Next.js to start
sleep 10

# Check if Next.js is running
if ! ps -p $NEXT_PID > /dev/null; then
    echo "Error: Next.js failed to start. Check nextjs.log for details."
    exit 1
fi

echo "Both servers are running. Use 'cat flask.log' or 'cat nextjs.log' to view logs."
echo "Flask is running on http://localhost:5001"
echo "Next.js is running on http://localhost:3000"
echo "Press Ctrl+C to stop the servers."

# Wait for both processes
wait $FLASK_PID $NEXT_PID
