#!/bin/bash

# Vendor Management System - Stop Script
# This script stops the Docker containers

echo "========================================="
echo "Vendor Management System - Stopping"
echo "========================================="
echo ""

# Stop the containers
echo "Stopping containers..."
docker-compose down

echo ""
echo "========================================="
echo "✅ Application stopped successfully!"
echo "========================================="
echo ""
echo "💾 Your data is preserved in Docker volumes"
echo "🔄 Run ./RUN-LOCAL.sh to start again"
echo ""
