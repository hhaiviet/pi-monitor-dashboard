#!/bin/bash

echo "🔧 Fixing n8n connection and redeploying..."

# Navigate to project
cd ~/pi-monitor-dashboard

# Backup current state
echo "📦 Backing up current state..."
sudo docker compose logs > logs_backup_$(date +%Y%m%d_%H%M%S).txt

# Stop all containers
echo "🛑 Stopping containers..."
sudo docker compose down

# Remove old images to force rebuild
echo "🗑️  Removing old images..."
sudo docker compose rm -f
sudo docker system prune -f

# Check if n8n is running on host
echo "🔍 Checking n8n on host..."
if curl -s http://localhost:5678/healthz > /dev/null; then
    echo "✅ n8n is running on Pi"
else
    echo "⚠️  WARNING: n8n not detected on localhost:5678"
    echo "   Please check: sudo systemctl status n8n"
    echo "   Or: docker ps | grep n8n"
fi

# Rebuild with no cache
echo "🔨 Building containers (this may take 3-5 minutes)..."
sudo docker compose build --no-cache --progress=plain

# Start services
echo "🚀 Starting services..."
sudo docker compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to initialize..."
sleep 10

# Check container status
echo "📊 Container status:"
sudo docker compose ps

# Check logs for errors
echo "📋 Checking logs for errors..."
sudo docker compose logs --tail=20 backend | grep -i error || echo "  ✅ No backend errors"
sudo docker compose logs --tail=20 frontend | grep -i error || echo "  ✅ No frontend errors"
sudo docker compose logs --tail=20 nginx | grep -i error || echo "  ✅ No nginx errors"

# Test endpoints
echo "🧪 Testing endpoints..."

# Test backend directly
if curl -s http://localhost:8000/api/system/stats > /dev/null; then
    echo "  ✅ Backend API responding"
else
    echo "  ❌ Backend API not responding"
fi

# Test frontend directly
if curl -s http://localhost:3000 > /dev/null; then
    echo "  ✅ Frontend responding"
else
    echo "  ❌ Frontend not responding"
fi

# Test nginx
if curl -s http://localhost > /dev/null; then
    echo "  ✅ Nginx responding"
else
    echo "  ❌ Nginx not responding"
fi

# Test n8n connection from backend
echo "🔗 Testing n8n connection from backend..."
sudo docker compose exec -T backend python -c "
import requests
import os
url = os.getenv('N8N_BASE_URL', 'http://192.168.1.99:5678')
try:
    r = requests.get(f'{url}/healthz', timeout=5)
    print(f'  ✅ n8n connection successful: {r.status_code}')
except Exception as e:
    print(f'  ❌ n8n connection failed: {e}')
"

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "🎉 Deployment complete!"
echo ""
echo "📍 Access points:"
echo "   Dashboard:  http://192.168.1.99"
echo "   API:        http://192.168.1.99/api/system/stats"
echo "   API Docs:   http://192.168.1.99/api/docs"
echo "   n8n:        http://192.168.1.99:5678"
echo ""
echo "📋 To view logs:"
echo "   sudo docker compose logs -f"
echo ""
echo "📋 To restart:"
echo "   sudo docker compose restart"
echo "═══════════════════════════════════════════════════════════"
