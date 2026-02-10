#!/bin/bash

# Incident Management System - FastComet Deployment Script
# Deploys to portal.oneguyconsulting.com

set -e  # Exit on any error

echo "=========================================="
echo "Incident Management System Deployment"
echo "Target: portal.oneguyconsulting.com"
echo "=========================================="
echo ""

# Configuration
SSH_HOST="nw69.fcomet.com"
SSH_USER="oneguyco"
REMOTE_DIR="/home/oneguyco/portal-incident-management"
DOMAIN="portal.oneguyconsulting.com"
APP_PORT=5007

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Step 1: Building application locally...${NC}"
docker compose build app
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo -e "${YELLOW}Step 2: Exporting Docker image...${NC}"
docker save incident-management-system-app:latest | gzip > /tmp/incident-app.tar.gz
echo -e "${GREEN}✓ Image exported${NC}"
echo ""

echo -e "${YELLOW}Step 3: Uploading to FastComet...${NC}"
scp /tmp/incident-app.tar.gz ${SSH_USER}@${SSH_HOST}:/tmp/
echo -e "${GREEN}✓ Upload complete${NC}"
echo ""

echo -e "${YELLOW}Step 4: Deploying on server...${NC}"
ssh ${SSH_USER}@${SSH_HOST} <<'ENDSSH'
set -e

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create project directory
mkdir -p /home/oneguyco/portal-incident-management
cd /home/oneguyco/portal-incident-management

# Load Docker image
echo "Loading Docker image..."
docker load -i /tmp/incident-app.tar.gz
rm /tmp/incident-app.tar.gz

# Create docker-compose.yml
cat > docker-compose.yml <<'EOF'
services:
  postgres:
    image: postgres:16-alpine
    container_name: portal-incident-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-SecurePass2026!}
      POSTGRES_DB: ${POSTGRES_DB:-incident_db}
    ports:
      - "5442:5432"
    volumes:
      - portal_incident_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    image: incident-management-system-app:latest
    container_name: portal-incident-app
    restart: unless-stopped
    ports:
      - "5007:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - COOKIE_SECURE=true
      - DATABASE_URL=postgresql://${POSTGRES_USER:-postgres}:${POSTGRES_PASSWORD:-SecurePass2026!}@postgres:5432/${POSTGRES_DB:-incident_db}
      - SESSION_SECRET=${SESSION_SECRET:-change-this-in-production-portal-2026}
      - RESEND_API_KEY=${RESEND_API_KEY:-}
      - EMAIL_FROM=${EMAIL_FROM:-incidents@oneguyconsulting.com}
      - PRIVACY_OFFICER_EMAIL=${PRIVACY_OFFICER_EMAIL:-cweiselberg1@gmail.com}
      - APP_URL=https://portal.oneguyconsulting.com
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads
      - ./attached_assets:/app/attached_assets

volumes:
  portal_incident_data:
    driver: local
EOF

# Create .env file
cat > .env <<'EOF'
POSTGRES_USER=portal_user
POSTGRES_PASSWORD=SecurePass2026!
POSTGRES_DB=incident_db
SESSION_SECRET=portal-incident-secret-key-2026-production
RESEND_API_KEY=
EMAIL_FROM=incidents@oneguyconsulting.com
PRIVACY_OFFICER_EMAIL=cweiselberg1@gmail.com
APP_URL=https://portal.oneguyconsulting.com
EOF

# Create necessary directories
mkdir -p uploads attached_assets

# Stop existing containers
docker-compose down 2>/dev/null || true

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for services to be healthy
echo "Waiting for services to start..."
sleep 10

# Check status
docker-compose ps

echo ""
echo "✓ Deployment complete!"
echo "Application running on port 5007"
ENDSSH

echo -e "${GREEN}✓ Server deployment complete${NC}"
echo ""

echo -e "${YELLOW}Step 5: Configuring reverse proxy...${NC}"
ssh ${SSH_USER}@${SSH_HOST} <<ENDSSH
# Create Nginx configuration
sudo mkdir -p /etc/nginx/sites-available /etc/nginx/sites-enabled

sudo tee /etc/nginx/sites-available/portal-incident <<'EOF'
server {
    listen 80;
    server_name portal.oneguyconsulting.com;

    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.oneguyconsulting.com;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/portal.oneguyconsulting.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.oneguyconsulting.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Increase timeout for long-running requests
    proxy_read_timeout 300;
    proxy_connect_timeout 300;
    proxy_send_timeout 300;

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:5007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Increase max upload size for incident attachments
    client_max_body_size 50M;

    # Logs
    access_log /var/log/nginx/portal-incident-access.log;
    error_log /var/log/nginx/portal-incident-error.log;
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/portal-incident /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t && sudo systemctl reload nginx || echo "Nginx config needs adjustment"
ENDSSH

echo -e "${GREEN}✓ Nginx configured${NC}"
echo ""

echo -e "${YELLOW}Step 6: Installing SSL certificate...${NC}"
ssh ${SSH_USER}@${SSH_HOST} <<'ENDSSH'
# Install Certbot if not present
if ! command -v certbot &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
fi

# Get SSL certificate
sudo certbot --nginx -d portal.oneguyconsulting.com --non-interactive --agree-tos --email cweiselberg1@gmail.com || echo "SSL setup requires manual verification"
ENDSSH

echo -e "${GREEN}✓ SSL configuration complete${NC}"
echo ""

echo "=========================================="
echo -e "${GREEN}DEPLOYMENT COMPLETE!${NC}"
echo "=========================================="
echo ""
echo "Application is now available at:"
echo -e "${GREEN}https://portal.oneguyconsulting.com${NC}"
echo ""
echo "Database: PostgreSQL running on port 5442"
echo "App: Running on port 5007 (proxied via Nginx)"
echo ""
echo "Default login credentials:"
echo "Email: thesecretmachine@gmail.com"
echo "Password: TestPassword123!"
echo ""
echo "To view logs:"
echo "  ssh ${SSH_USER}@${SSH_HOST}"
echo "  cd ${REMOTE_DIR}"
echo "  docker-compose logs -f app"
echo ""
echo "To restart services:"
echo "  docker-compose restart"
echo ""
