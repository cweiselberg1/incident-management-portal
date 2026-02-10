#!/bin/bash
set -e

echo "🚀 Deploying Incident Management Portal to Contabo VPS..."

# Install Node.js 18 if not present
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
fi

# Install nginx if not present
if ! command -v nginx &> /dev/null; then
    echo "📦 Installing nginx..."
    apt-get update
    apt-get install -y nginx certbot python3-certbot-nginx
fi

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "📦 Installing PM2..."
    npm install -g pm2
fi

# Create app directory
mkdir -p /var/www/incident-portal
cd /var/www/incident-portal

# Clone from GitHub
echo "📥 Cloning application..."
git clone https://github.com/cweiselberg1/incident-management-portal.git .

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build application
echo "🏗️  Building application..."
npm run build

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=5007
COOKIE_SECURE=true
DATABASE_URL=postgresql://postgres:TrumpDiddlesKid$123@db.evjheselciisyjquhbsc.supabase.co:5432/postgres
SESSION_SECRET=portal-incident-secret-2026-prod
RESEND_API_KEY=
EMAIL_FROM=incidents@oneguyconsulting.com
PRIVACY_OFFICER_EMAIL=cweiselberg1@gmail.com
APP_URL=https://portal.oneguyconsulting.com
EOF

# Start with PM2
echo "🚀 Starting application with PM2..."
pm2 delete incident-portal 2>/dev/null || true
pm2 start dist/index.js --name incident-portal
pm2 save
pm2 startup systemd -u root --hp /root

# Configure nginx
echo "⚙️  Configuring nginx..."
cat > /etc/nginx/sites-available/incident-portal << 'EOF'
server {
    listen 80;
    server_name portal.oneguyconsulting.com;

    location / {
        proxy_pass http://localhost:5007;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/incident-portal /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test nginx config
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Point portal.oneguyconsulting.com DNS to this server IP: $(curl -s ifconfig.me)"
echo "2. Wait for DNS propagation (5-30 minutes)"
echo "3. Run: certbot --nginx -d portal.oneguyconsulting.com"
echo ""
echo "🌐 Application is running at: http://$(curl -s ifconfig.me):5007"
echo ""
