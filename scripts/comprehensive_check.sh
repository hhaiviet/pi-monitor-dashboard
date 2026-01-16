#!/bin/bash

echo "═══════════════════════════════════════════════════════════════"
echo "🔍 PI MONITOR DASHBOARD - COMPREHENSIVE DIAGNOSTIC"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

cd ~/pi-monitor-dashboard

echo "📊 CONTAINER STATUS"
echo "---"
sudo docker compose ps
echo ""

echo "📁 DATA DIRECTORY"
echo "---"
ls -lh data/ 2>/dev/null || echo "❌ Data directory not found"
echo ""

echo "🗄️  DATABASE CHECK"
echo "---"
sudo docker compose exec -T backend python3 << 'PYEOF'
import sqlite3
import os
from datetime import datetime

db_path = '/app/data/monitor.db'
if os.path.exists(db_path):
    print(f"✅ Database exists: {db_path}")
    print(f"   Size: {os.path.getsize(db_path)} bytes")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Check tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()
    print(f"   Tables: {[t[0] for t in tables]}")
    
    # Check system_metrics
    try:
        cursor.execute("SELECT COUNT(*) FROM system_metrics")
        count = cursor.fetchone()[0]
        print(f"   Records in system_metrics: {count}")
        
        if count > 0:
            cursor.execute("SELECT * FROM system_metrics ORDER BY timestamp DESC LIMIT 3")
            latest = cursor.fetchall()
            print(f"   Latest 3 records:")
            for row in latest:
                print(f"     {row}")
        else:
            print("   ⚠️  No data in system_metrics table")
    except Exception as e:
        print(f"   ❌ Error querying system_metrics: {e}")
    
    conn.close()
else:
    print(f"❌ Database not found at {db_path}")
PYEOF
echo ""

echo "🔗 N8N CONNECTION TEST"
echo "---"
sudo docker compose exec -T backend python3 << 'PYEOF'
import os
import requests

url = os.getenv('N8N_BASE_URL', 'http://192.168.1.99:5678')
api_key = os.getenv('N8N_API_KEY')

print(f"N8N_BASE_URL: {url}")
print(f"API Key configured: {'Yes' if api_key else 'No'}")

try:
    # Health check
    r = requests.get(f'{url}/healthz', timeout=5)
    print(f"✅ Health check: {r.status_code}")
    
    # Workflows
    r = requests.get(
        f'{url}/api/v1/workflows',
        headers={'X-N8N-API-KEY': api_key},
        timeout=5
    )
    print(f"✅ Workflows API: {r.status_code}")
    if r.status_code == 200:
        data = r.json()
        workflows = data.get('data', [])
        print(f"   Total workflows: {len(workflows)}")
        if workflows:
            print(f"   First workflow: {workflows[0].get('name', 'N/A')}")
except Exception as e:
    print(f"❌ Connection error: {e}")
PYEOF
echo ""

echo "🌐 API ENDPOINTS TEST"
echo "---"

# Test system stats
echo -n "GET /api/system/stats: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/system/stats)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ $STATUS${NC}"
else
    echo -e "${RED}❌ $STATUS${NC}"
fi

# Test system history
echo -n "GET /api/system/history: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost/api/system/history?hours=24")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ $STATUS${NC}"
    HISTORY_DATA=$(curl -s "http://localhost/api/system/history?hours=24")
    COUNT=$(echo "$HISTORY_DATA" | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('data', [])))")
    echo "   Data points: $COUNT"
else
    echo -e "${RED}❌ $STATUS${NC}"
fi

# Test n8n status
echo -n "GET /api/n8n/status: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/n8n/status)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ $STATUS${NC}"
    N8N_STATUS=$(curl -s http://localhost/api/n8n/status | python3 -c "import sys, json; data=json.load(sys.stdin); print(data.get('status', 'unknown'))")
    echo "   Status: $N8N_STATUS"
else
    echo -e "${RED}❌ $STATUS${NC}"
fi

# Test n8n workflows
echo -n "GET /api/n8n/workflows: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/n8n/workflows)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ $STATUS${NC}"
    WF_COUNT=$(curl -s http://localhost/api/n8n/workflows | python3 -c "import sys, json; data=json.load(sys.stdin); print(len(data.get('workflows', [])))")
    echo "   Workflows: $WF_COUNT"
else
    echo -e "${RED}❌ $STATUS${NC}"
fi

# Test processes
echo -n "GET /api/processes: "
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/api/processes)
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✅ $STATUS${NC}"
else
    echo -e "${RED}❌ $STATUS${NC}"
fi

echo ""
echo "📋 BACKEND LOGS (Last 15 lines)"
echo "---"
sudo docker compose logs backend --tail=15 | grep -v "GET /api"

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "✅ DIAGNOSTIC COMPLETE"
echo "═══════════════════════════════════════════════════════════════"
