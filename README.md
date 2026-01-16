# Raspberry Pi Resource Monitor + n8n Manager Dashboard

A comprehensive dashboard for monitoring Raspberry Pi resources and managing n8n services.

## Features

- **Real-time Monitoring**: CPU, RAM, Disk, Temperature, Network.
- **n8n Management**: Start, Stop, Restart, View Logs.
- **Process Management**: View and kill running processes.
- **Docker Integration**: View container status.
- **Historical Data**: 24h charts for resource usage.
- **Alerts**: Webhook notifications for high resource usage.
- **Responsive UI**: Mobile-first design with Dark/Light mode.

## Tech Stack

- **Frontend**: React, Vite, TailwindCSS, Recharts
- **Backend**: FastAPI, Python 3.9+
- **Database**: SQLite
- **Deployment**: Docker Compose, Nginx

## Installation

### Prerequisites
- Docker & Docker Compose
- Raspberry Pi (64-bit OS recommended)

### Quick Start
1. Clone the repository:
   ```bash
   git clone https://github.com/hhaiviet/pi-monitor-dashboard.git
   cd pi-monitor-dashboard
   ```
2. Create environment file:
   ```bash
   cp .env.example .env
   ```
3. Start services:
   ```bash
   docker-compose up -d
   ```
4. Access the dashboard:
   - Web UI: http://raspberry-pi.local
   - API Docs: http://raspberry-pi.local/docs

## Development

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## License
MIT
