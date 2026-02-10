#!/bin/bash

# Incident Management System - FastComet Shared Hosting Deployment
# Portal: portal.oneguyconsulting.com

set -e

echo "=========================================="
echo "Deploying to FastComet Shared Hosting"
echo "Portal: portal.oneguyconsulting.com"
echo "=========================================="
echo ""

# Configuration
SSH_HOST="nw69.fcomet.com"
SSH_USER="oneguyco"
REMOTE_DIR="/home/oneguyco/portal-incident"
LOCAL_DIR="/Users/chuckw./incident-management-system"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW}Step 1: Building application locally...${NC}"
cd "$LOCAL_DIR"

# Install dependencies
npm install

# Build client
cd client
npm install
npm run build
cd ..

# Build server
npm run build

echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo -e "${YELLOW}Step 2: Creating deployment package...${NC}"
tar -czf /tmp/incident-portal.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='client/node_modules' \
  --exclude='client/src' \
  dist/ \
  server/ \
  package.json \
  package-lock.json \
  drizzle.config.ts

echo -e "${GREEN}✓ Package created${NC}"
echo ""

echo -e "${YELLOW}Step 3: Uploading to FastComet...${NC}"
scp /tmp/incident-portal.tar.gz ${SSH_USER}@${SSH_HOST}:/tmp/
echo -e "${GREEN}✓ Upload complete${NC}"
echo ""

echo -e "${YELLOW}Step 4: Setting up on server...${NC}"
ssh ${SSH_USER}@${SSH_HOST} bash <<'ENDSSH'
set -e

# Create app directory
mkdir -p ~/portal-incident
cd ~/portal-incident

# Extract files
tar -xzf /tmp/incident-portal.tar.gz
rm /tmp/incident-portal.tar.gz

# Install production dependencies
npm install --production

# Install PM2 globally if not present
npm list -g pm2 || npm install -g pm2

# Create .env file
cat > .env <<'EOF'
NODE_ENV=production
PORT=5007
COOKIE_SECURE=true
SESSION_SECRET=portal-incident-secret-2026-prod
RESEND_API_KEY=
EMAIL_FROM=incidents@oneguyconsulting.com
PRIVACY_OFFICER_EMAIL=cweiselberg1@gmail.com
APP_URL=https://portal.oneguyconsulting.com
EOF

echo ""
echo "✓ Application files deployed"
echo ""
echo "⚠️  IMPORTANT: Database Setup Required"
echo ""
echo "Option 1: Supabase (Recommended for Shared Hosting)"
echo "  1. Go to https://supabase.com"
echo "  2. Create a new project"
echo "  3. Go to Project Settings > Database"
echo "  4. Copy the connection string"
echo "  5. Add to .env file:"
echo "     DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres"
echo ""
echo "Option 2: FastComet MySQL (via cPanel)"
echo "  1. Log into cPanel"
echo "  2. Create MySQL database"
echo "  3. Update app to use MySQL instead of PostgreSQL"
echo ""
echo "After database is configured, run:"
echo "  cd ~/portal-incident"
echo "  pm2 start dist/index.js --name incident-portal"
echo "  pm2 save"
echo "  pm2 startup"
echo ""
ENDSSH

echo -e "${GREEN}✓ Deployment complete${NC}"
echo ""

echo "=========================================="
echo "NEXT STEPS"
echo "=========================================="
echo ""
echo "1. Set up Supabase database:"
echo "   - Go to https://supabase.com/dashboard"
echo "   - Create a new project"
echo "   - Get the connection string"
echo ""
echo "2. Configure database on server:"
echo "   ssh ${SSH_USER}@${SSH_HOST}"
echo "   cd ~/portal-incident"
echo "   nano .env"
echo "   # Add DATABASE_URL=..."
echo ""
echo "3. Start the application:"
echo "   pm2 start dist/index.js --name incident-portal"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "4. Configure subdomain in cPanel:"
echo "   - Login to FastComet cPanel"
echo "   - Go to Domains > Subdomains"
echo "   - Create: portal.oneguyconsulting.com"
echo "   - Point to: ~/portal-incident/dist/public"
echo "   - Set up Node.js app (port 5007)"
echo ""
echo "5. Enable SSL:"
echo "   - In cPanel, go to SSL/TLS"
echo "   - Use AutoSSL for portal.oneguyconsulting.com"
echo ""
