FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Install systemd support libs if needed, but we use subprocess for systemctl usually
# However, inside Docker, controlling host systemctl is tricky. 
# We will assume we mount the socket or runs in privileged mode if we really need to control host services.
# For now, we just run the app.

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
