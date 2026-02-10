# Final Setup Steps - Incident Management Portal

## ✅ What's Already Done

- [x] Application built locally
- [x] Files uploaded to FastComet server
- [x] Dependencies installed on server
- [x] PM2 process manager installed
- [x] Environment file created
- [x] Application directory: `~/portal-incident`

## 🔧 What You Need to Do (15 minutes)

### Step 1: Set Up Supabase Database (5 min)

1. **Go to https://supabase.com and sign in**
   - Use your email: cweiselberg1@gmail.com

2. **Create New Project**
   - Click "New Project"
   - Name: `incident-management`
   - Database Password: Create a strong password (save it!)
   - Region: Choose closest region
   - Click "Create new project"
   - Wait 2-3 minutes

3. **Get Connection String**
   - Go to Project Settings (gear icon)
   - Click "Database"
   - Under "Connection string", copy the **URI** format
   - It looks like: `postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
   - **Copy this - you'll need it in Step 2**

4. **Create Database Tables**
   - In Supabase, go to SQL Editor
   - Click "New query"
   - Copy and paste this SQL:

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Incidents table
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

-- Create admin user
INSERT INTO users (username, email, password, role)
VALUES (
  'admin',
  'cweiselberg1@gmail.com',
  '$2b$10$0i.ZSHLAIMCuQmS66JZ2Xu3ruciH2AdzUfeUmncT71nFzTmkh4mSy',
  'privacy_officer'
)
ON CONFLICT (email) DO NOTHING;

-- Create test user
INSERT INTO users (username, email, password, role)
VALUES (
  'testuser',
  'thesecretmachine@gmail.com',
  '$2b$10$0i.ZSHLAIMCuQmS66JZ2Xu3ruciH2AdzUfeUmncT71nFzTmkh4mSy',
  'privacy_officer'
)
ON CONFLICT (email) DO NOTHING;
```

   - Click "Run"
   - You should see "Success"

### Step 2: Configure Database on Server (2 min)

Run these commands in your terminal:

```bash
# SSH into server
ssh oneguyco@nw69.fcomet.com

# Edit environment file
cd ~/portal-incident
nano .env
```

Add your Supabase connection string as `DATABASE_URL`:

```env
NODE_ENV=production
PORT=5007
COOKIE_SECURE=true
DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
SESSION_SECRET=portal-incident-secret-2026-prod
RESEND_API_KEY=
EMAIL_FROM=incidents@oneguyconsulting.com
PRIVACY_OFFICER_EMAIL=cweiselberg1@gmail.com
APP_URL=https://portal.oneguyconsulting.com
```

Save with: `Ctrl+X`, then `Y`, then `Enter`

### Step 3: Start the Application (1 min)

Still in SSH:

```bash
# Start with PM2
pm2 start dist/index.js --name incident-portal

# Save PM2 config
pm2 save

# Set up PM2 to auto-start on reboot
pm2 startup
# Copy and run the command that PM2 outputs

# Check status
pm2 status
pm2 logs incident-portal --lines 20
```

You should see the app running on port 5007.

### Step 4: Configure Subdomain in cPanel (5 min)

1. **Log into FastComet cPanel**
   - URL: https://cloud.fastcomet.com
   - Email: cweiselberg1@gmail.com
   - Password: Tr3ntRezn0r123

2. **Create Subdomain**
   - Find "Domains" section
   - Click "Subdomains"
   - Subdomain: `portal`
   - Domain: `oneguyconsulting.com`
   - Click "Create"

3. **Set up Node.js Application**
   - Search for "Setup Node.js App" in cPanel
   - Click "Create Application"
   - **Node.js version**: 18.x
   - **Application mode**: Production
   - **Application root**: `portal-incident`
   - **Application URL**: `portal.oneguyconsulting.com`
   - **Application startup file**: `dist/index.js`
   - **Passenger log file**: Leave default
   - **Environment variables**: (add these)
     ```
     NODE_ENV=production
     PORT=5007
     ```
   - Click "Create"
   - Click "Start App"

4. **Enable SSL**
   - In cPanel, go to "SSL/TLS Status"
   - Find `portal.oneguyconsulting.com`
   - Click "Run AutoSSL"
   - Wait 2-3 minutes

### Step 5: Test Everything (2 min)

1. **Visit https://portal.oneguyconsulting.com**

2. **Login with:**
   - Email: `cweiselberg1@gmail.com`
   - Password: `TestPassword123!`

3. **Test features:**
   - View dashboard
   - Click "Report Incident"
   - Fill out form with "Anonymous" as reporter
   - Submit incident
   - Verify it appears in dashboard

## ✅ Success Checklist

After completing above steps, verify:

- [ ] Can access https://portal.oneguyconsulting.com (no errors)
- [ ] SSL certificate shows as secure (padlock icon)
- [ ] Login page loads
- [ ] Can login with test credentials
- [ ] Dashboard displays (no PHI column!)
- [ ] Can access report form
- [ ] Can submit incident report
- [ ] Incident appears in dashboard
- [ ] Anonymous reporting works

## 🔍 Troubleshooting

### "Can't reach portal.oneguyconsulting.com"
- DNS may still be propagating (wait 15-30 min)
- Check DNS: https://dnschecker.org
- Verify subdomain created in cPanel

### "Application not responding"
```bash
ssh oneguyco@nw69.fcomet.com
cd ~/portal-incident
pm2 status
pm2 logs incident-portal --err
```

### "Database connection error"
- Verify DATABASE_URL is correct in .env
- Check Supabase project is running
- Test connection from server:
```bash
node -e "const pg = require('pg'); const pool = new pg.Pool({connectionString: process.env.DATABASE_URL}); pool.query('SELECT NOW()').then(r => console.log('✓ Connected:', r.rows[0])).catch(e => console.error('✗ Error:', e.message));"
```

### "502 Bad Gateway"
- App might have crashed
- Check PM2 logs: `pm2 logs incident-portal`
- Restart: `pm2 restart incident-portal`

### "Can't login"
- Verify database tables were created
- Check PM2 logs for errors
- Verify users table has admin user

## 📞 Support

- **FastComet Support**: Open ticket at https://cloud.fastcomet.com
- **Supabase Support**: https://supabase.com/support
- **Check server**: `ssh oneguyco@nw69.fcomet.com`
- **Check logs**: `pm2 logs incident-portal`

## 📋 Quick Reference

**Portal URL**: https://portal.oneguyconsulting.com

**SSH Access**: `ssh oneguyco@nw69.fcomet.com`

**App Directory**: `~/portal-incident`

**App Commands**:
```bash
pm2 status                    # Check status
pm2 logs incident-portal      # View logs
pm2 restart incident-portal   # Restart app
pm2 stop incident-portal      # Stop app
```

**Default Login**:
- Email: cweiselberg1@gmail.com
- Password: TestPassword123!

---

**Once everything works, you should:**
1. Change your admin password
2. Create accounts for other users
3. Test all features thoroughly
4. Set up regular database backups in Supabase
