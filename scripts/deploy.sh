#!/bin/bash

# Navigate to project dir
cd /home/pi/pi-monitor-dashboard

# Pull latest
git pull origin main

# Rebuild and start
docker-compose down
docker-compose up -d --build

# Check health
./scripts/health_check.sh
