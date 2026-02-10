# Incident Management System - Deployment Guide

## Overview

This guide covers deploying the Incident Management System to **portal.oneguyconsulting.com** on FastComet hosting.

## Pre-Deployment Checklist

- [x] Application tested locally (http://localhost:5006)
- [x] Docker containers working
- [x] Database migrations tested
- [x] Authentication working
- [x] PHI column removed from dashboard
- [ ] FastComet SSH access verified
- [ ] Domain DNS configured
- [ ] SSL certificate ready

## Deployment Architecture

```
User Browser
    ↓
HTTPS (port 443)
    ↓
Nginx Reverse Proxy
    ↓
Node.js App (port 5007)
    ↓
PostgreSQL Database (port 5442)
```

## Quick Deployment

### Option 1: Automated Script (Recommended)

```bash
cd /Users/chuckw./incident-management-system
./deploy-to-fastcomet.sh
```

This script will:
1. Build Docker image locally
2. Export and upload to FastComet
3. Deploy PostgreSQL + App containers
4. Configure Nginx reverse proxy
5. Install SSL certificate

### Option 2: Manual Deployment

If the automated script fails, follow these manual steps:

#### Step 1: SSH into FastComet

```bash
ssh oneguyco@nw69.fcomet.com
```

#### Step 2: Install Docker & Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Log out and back in for group changes
exit
ssh oneguyco@nw69.fcomet.com
```

#### Step 3: Create Project Directory

```bash
mkdir -p ~/portal-incident-management
cd ~/portal-incident-management
```

#### Step 4: Upload Application Files

On your local machine:

```bash
cd /Users/chuckw./incident-management-system

# Create deployment package
tar -czf incident-app.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='uploads' \
  Dockerfile \
  package*.json \
  server/ \
  client/ \
  shared/ \
  drizzle.config.ts

# Upload to server
scp incident-app.tar.gz oneguyco@nw69.fcomet.com:~/portal-incident-management/
```

#### Step 5: Extract and Setup on Server

```bash
ssh oneguyco@nw69.fcomet.com
cd ~/portal-incident-management
tar -xzf incident-app.tar.gz
rm incident-app.tar.gz
```

#### Step 6: Create docker-compose.yml

```bash
cat > docker-compose.yml <<'EOF'
services:
  postgres:
    image: postgres:16-alpine
    container_name: portal-incident-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: portal_user
      POSTGRES_PASSWORD: SecurePass2026!
      POSTGRES_DB: incident_db
    ports:
      - "5442:5432"
    volumes:
      - portal_incident_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U portal_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: portal-incident-app
    restart: unless-stopped
    ports:
      - "5007:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - COOKIE_SECURE=true
      - DATABASE_URL=postgresql://portal_user:SecurePass2026!@postgres:5432/incident_db
      - SESSION_SECRET=portal-incident-secret-key-2026-production
      - RESEND_API_KEY=
      - EMAIL_FROM=incidents@oneguyconsulting.com
      - PRIVACY_OFFICER_EMAIL=cweiselberg1@gmail.com
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
```

#### Step 7: Create Directories and Start Services

```bash
mkdir -p uploads attached_assets

# Build and start
docker-compose up -d --build

# Check status
docker-compose ps
docker-compose logs -f app
```

#### Step 8: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/portal-incident
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name portal.oneguyconsulting.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name portal.oneguyconsulting.com;

    ssl_certificate /etc/letsencrypt/live/portal.oneguyconsulting.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/portal.oneguyconsulting.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:5007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/portal-incident-access.log;
    error_log /var/log/nginx/portal-incident-error.log;
}
```

Enable and test:

```bash
sudo ln -sf /etc/nginx/sites-available/portal-incident /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### Step 9: Install SSL Certificate

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d portal.oneguyconsulting.com --email cweiselberg1@gmail.com
```

## Post-Deployment

### Create Initial Admin User

```bash
# SSH into server
ssh oneguyco@nw69.fcomet.com
cd ~/portal-incident-management

# Access database
docker-compose exec postgres psql -U portal_user -d incident_db

# Create admin user
INSERT INTO users (id, username, email, password, role)
VALUES (
  gen_random_uuid(),
  'admin',
  'cweiselberg1@gmail.com',
  '$2b$10$0i.ZSHLAIMCuQmS66JZ2Xu3ruciH2AdzUfeUmncT71nFzTmkh4mSy',
  'privacy_officer'
);

\q
```

### Test the Deployment

1. Visit https://portal.oneguyconsulting.com
2. Login with: cweiselberg1@gmail.com / TestPassword123!
3. Verify dashboard loads
4. Test reporting an incident
5. Verify anonymous reporting works

### Monitor Logs

```bash
# Application logs
docker-compose logs -f app

# Nginx logs
sudo tail -f /var/log/nginx/portal-incident-access.log
sudo tail -f /var/log/nginx/portal-incident-error.log

# Database logs
docker-compose logs -f postgres
```

## Maintenance

### Update Application

```bash
cd ~/portal-incident-management

# Pull latest code or upload new files
# Then rebuild:
docker-compose down
docker-compose up -d --build
```

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U portal_user incident_db > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20260210.sql | docker-compose exec -T postgres psql -U portal_user incident_db
```

### Restart Services

```bash
# Restart app only
docker-compose restart app

# Restart all services
docker-compose restart

# Stop all services
docker-compose down

# Start all services
docker-compose up -d
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using port 5007
sudo lsof -i :5007

# Kill process if needed
sudo kill -9 <PID>
```

### Container Won't Start

```bash
# Check logs
docker-compose logs app

# Rebuild from scratch
docker-compose down -v
docker-compose up -d --build
```

### Database Connection Issues

```bash
# Check database is running
docker-compose ps postgres

# Check connection
docker-compose exec app node -e "console.log(process.env.DATABASE_URL)"

# Access database directly
docker-compose exec postgres psql -U portal_user -d incident_db
```

### Nginx Issues

```bash
# Test configuration
sudo nginx -t

# Reload configuration
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Check status
sudo systemctl status nginx
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew

# Test renewal
sudo certbot renew --dry-run
```

## Security Considerations

1. **Change default credentials** after first login
2. **Update SESSION_SECRET** in docker-compose.yml to a random string
3. **Configure firewall** to only allow ports 80, 443, and SSH
4. **Enable automatic security updates**
5. **Set up regular backups** of the database

## Support

For issues:
- Check logs: `docker-compose logs -f`
- Restart services: `docker-compose restart`
- Contact FastComet support for server issues

## Access Information

- **URL**: https://portal.oneguyconsulting.com
- **SSH**: ssh oneguyco@nw69.fcomet.com
- **Project Directory**: ~/portal-incident-management
- **Database Port**: 5442
- **App Port**: 5007 (proxied through Nginx)

## Default Credentials

**Admin Account:**
- Email: cweiselberg1@gmail.com
- Password: TestPassword123!
- Role: privacy_officer

**Test Account:**
- Email: thesecretmachine@gmail.com
- Password: TestPassword123!
- Role: privacy_officer

---

**Deployment Status**: Ready for deployment
**Last Updated**: 2026-02-10
