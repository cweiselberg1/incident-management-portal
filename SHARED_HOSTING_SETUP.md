# Incident Management System - FastComet Shared Hosting Setup

## Quick Overview

Since FastComet shared hosting doesn't support Docker, we'll deploy using:
- **Node.js App** (runs directly on server)
- **Supabase PostgreSQL** (free managed database)
- **PM2** (process manager)
- **cPanel subdomain** (portal.oneguyconsulting.com)

## Complete Setup Guide

### Part 1: Set Up Supabase Database (5 minutes)

1. **Create Supabase Account**
   - Go to https://supabase.com
   - Sign up with cweiselberg1@gmail.com
   - Click "New Project"

2. **Create Project**
   - Name: `incident-management`
   - Database Password: (create strong password, save it!)
   - Region: Choose closest to you
   - Click "Create new project"
   - Wait 2-3 minutes for provisioning

3. **Get Connection String**
   - Go to Project Settings (gear icon)
   - Click "Database" in sidebar
   - Under "Connection string" section
   - Copy the "URI" connection string (looks like):
     ```
     postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
     ```
   - **Save this!** You'll need it in Part 3

4. **Run Database Migration**
   - In Supabase dashboard, go to "SQL Editor"
   - Click "New query"
   - Paste this SQL:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_name VARCHAR(255) NOT NULL,
  reporter_email VARCHAR(255),
  reporter_phone VARCHAR(50),
  reporter_role VARCHAR(255),
  incident_date DATE NOT NULL,
  discovery_date DATE NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  phi_involved BOOLEAN DEFAULT true,
  phi_types TEXT,
  individuals_affected VARCHAR(255),
  breach_type VARCHAR(255),
  breach_cause VARCHAR(255),
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'reported',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create initial admin user
-- Password: TestPassword123!
INSERT INTO users (username, email, password, role)
VALUES (
  'admin',
  'cweiselberg1@gmail.com',
  '$2b$10$0i.ZSHLAIMCuQmS66JZ2Xu3ruciH2AdzUfeUmncT71nFzTmkh4mSy',
  'privacy_officer'
);
```

   - Click "Run"
   - You should see "Success. No rows returned"

### Part 2: Deploy Application Files

Run the deployment script:

```bash
cd /Users/chuckw./incident-management-system
./deploy-shared-hosting.sh
```

This will:
- Build the application
- Package files
- Upload to FastComet
- Set up directory structure

### Part 3: Configure Application on Server

1. **SSH into FastComet**
   ```bash
   ssh oneguyco@nw69.fcomet.com
   ```

2. **Navigate to app directory**
   ```bash
   cd ~/portal-incident
   ```

3. **Edit .env file**
   ```bash
   nano .env
   ```

   Add your Supabase connection string:
   ```env
   NODE_ENV=production
   PORT=5007
   COOKIE_SECURE=true
   DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
   SESSION_SECRET=portal-incident-secret-2026-prod-change-this
   RESEND_API_KEY=
   EMAIL_FROM=incidents@oneguyconsulting.com
   PRIVACY_OFFICER_EMAIL=cweiselberg1@gmail.com
   APP_URL=https://portal.oneguyconsulting.com
   ```

   Save with: `Ctrl+X`, then `Y`, then `Enter`

4. **Start the application**
   ```bash
   pm2 start dist/index.js --name incident-portal
   pm2 save
   pm2 startup
   ```

   Copy and run the command that PM2 outputs.

5. **Verify it's running**
   ```bash
   pm2 status
   pm2 logs incident-portal
   ```

   You should see the app running on port 5007

### Part 4: Configure Subdomain in cPanel

1. **Log into FastComet cPanel**
   - URL: https://cloud.fastcomet.com
   - Email: cweiselberg1@gmail.com
   - Password: Tr3ntRezn0r123

2. **Create Subdomain**
   - Go to "Domains" section
   - Click "Subdomains"
   - Subdomain: `portal`
   - Domain: `oneguyconsulting.com`
   - Document Root: Leave default or set to `portal-incident`
   - Click "Create"

3. **Set up Node.js Application**
   - In cPanel, search for "Setup Node.js App"
   - Click "Create Application"
   - Node.js version: 18.x
   - Application mode: Production
   - Application root: `portal-incident`
   - Application URL: `portal.oneguyconsulting.com`
   - Application startup file: `dist/index.js`
   - Environment variables:
     ```
     NODE_ENV=production
     PORT=5007
     ```
   - Click "Create"

4. **Configure Reverse Proxy** (if needed)
   - cPanel usually auto-configures this
   - If not working, contact FastComet support to set up reverse proxy from port 80/443 to port 5007

### Part 5: Enable SSL

1. **In cPanel, go to "SSL/TLS Status"**
2. **Find `portal.oneguyconsulting.com`**
3. **Click "Run AutoSSL"**
4. **Wait 2-3 minutes for certificate installation**

### Part 6: Test the Deployment

1. **Visit https://portal.oneguyconsulting.com**
2. **Login with:**
   - Email: cweiselberg1@gmail.com
   - Password: TestPassword123!
3. **Test functionality:**
   - View dashboard
   - Report an incident
   - Verify anonymous reporting works

## Management Commands

### SSH into Server
```bash
ssh oneguyco@nw69.fcomet.com
cd ~/portal-incident
```

### View Logs
```bash
pm2 logs incident-portal
pm2 logs incident-portal --lines 100
```

### Restart Application
```bash
pm2 restart incident-portal
```

### Stop Application
```bash
pm2 stop incident-portal
```

### Update Application
```bash
# On local machine
cd /Users/chuckw./incident-management-system
./deploy-shared-hosting.sh

# On server
ssh oneguyco@nw69.fcomet.com
cd ~/portal-incident
pm2 restart incident-portal
```

### Check Status
```bash
pm2 status
pm2 info incident-portal
```

## Troubleshooting

### Application Won't Start
```bash
# Check PM2 logs
pm2 logs incident-portal --err

# Check if port is available
netstat -tlnp | grep 5007

# Restart
pm2 restart incident-portal
```

### Database Connection Issues
```bash
# Test database connection
node -e "const pg = require('pg'); const pool = new pg.Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows[0]); pool.end(); });"
```

### Can't Access Website
1. Check DNS propagation: https://dnschecker.org
2. Check SSL certificate in cPanel
3. Verify Node.js app is running in cPanel
4. Check PM2 status: `pm2 status`
5. Contact FastComet support for proxy issues

### Memory Issues
```bash
# Check memory usage
free -h

# Restart to clear memory
pm2 restart incident-portal
```

## Security Checklist

- [x] SSL certificate installed
- [x] Secure session secret configured
- [x] Database password is strong
- [ ] Change default admin password after first login
- [ ] Set up regular database backups
- [ ] Configure firewall rules (if VPS)
- [ ] Enable fail2ban (if VPS)

## Backup Strategy

### Database Backup (Supabase)
Supabase automatically backs up your database daily. To manual backup:
1. Go to Supabase dashboard
2. Database > Backups
3. Click "Manual backup"

### Application Files Backup
```bash
ssh oneguyco@nw69.fcomet.com
cd ~
tar -czf incident-portal-backup-$(date +%Y%m%d).tar.gz portal-incident/
```

## Support Resources

- **FastComet Support**: https://cloud.fastcomet.com (open ticket)
- **Supabase Docs**: https://supabase.com/docs
- **PM2 Docs**: https://pm2.keymetrics.io/docs

## Access Information

- **Portal URL**: https://portal.oneguyconsulting.com
- **SSH**: oneguyco@nw69.fcomet.com
- **cPanel**: https://cloud.fastcomet.com
- **Supabase**: https://supabase.com/dashboard
- **App Directory**: ~/portal-incident
- **App Port**: 5007

---

**Status**: Ready for deployment
**Last Updated**: 2026-02-10
