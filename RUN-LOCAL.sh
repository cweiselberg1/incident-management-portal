#!/bin/bash

# Vendor Management System - Local Docker Startup Script
# This script starts the application in Docker containers

echo "========================================="
echo "Vendor Management System - Docker Startup"
echo "========================================="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running!"
    echo "Starting Docker Desktop..."
    open -a Docker
    echo "Waiting for Docker to start..."

    # Wait for Docker to be ready (max 60 seconds)
    counter=0
    while ! docker info > /dev/null 2>&1; do
        sleep 2
        counter=$((counter + 2))
        if [ $counter -ge 60 ]; then
            echo "❌ Docker failed to start within 60 seconds."
            echo "Please start Docker Desktop manually and try again."
            exit 1
        fi
    done
    echo "✅ Docker is ready!"
    echo ""
fi

# Start the containers
echo "Starting containers..."
docker-compose up -d

echo ""
echo "Waiting for application to be ready..."
sleep 5

# Check container status
echo ""
echo "Container Status:"
docker-compose ps

echo ""
echo "========================================="
echo "✅ Application is running!"
echo "========================================="
echo ""
echo "🌐 Access the application at:"
echo "   http://localhost:5005"
echo ""
echo "📊 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop the application:"
echo "   docker-compose down"
echo ""
echo "========================================="
