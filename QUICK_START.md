# HIPAA Incident Management System - Quick Start Guide

## 🚀 Starting the System

### Start Docker Containers
```bash
cd /Users/chuckw./incident-management-system
docker-compose up -d
```

### Stop Docker Containers
```bash
docker-compose down
```

### View Logs
```bash
docker logs incident-management-app --tail 50 -f
```

---

## 🌐 Accessing the System

**Application URL:** http://localhost:5006

### Available Pages
- **Home/Dashboard:** http://localhost:5006/
- **Anonymous Reporting:** http://localhost:5006/report
- **Login:** http://localhost:5006/login
- **Signup:** http://localhost:5006/signup

---

## 👥 User Roles

### 1. Anonymous Reporter (No Account Needed)
- Can submit incidents without login
- Maintains HIPAA compliance for anonymous reporting
- Access: http://localhost:5006/report

### 2. Regular User
- Can login to access training modules (Phase 2)
- Can view their own incident reports
- Can complete required training

### 3. Privacy Officer
- Full access to all incidents
- Can update incident status and details
- Receives email notifications on new incidents
- Dashboard access to manage all incidents

### 4. Admin (Future)
- All Privacy Officer permissions
- User management capabilities
- System configuration

---

## 🔐 Creating Accounts

### Create Privacy Officer Account

1. **Navigate to signup page:**
   ```
   http://localhost:5006/signup
   ```

2. **Fill in the form:**
   - Email: your.email@company.com
   - Username: your-username
   - Password: (minimum 8 characters)

3. **Update role in database:**
   ```bash
   docker exec -it incident-management-db psql -U postgres -d incident_db
   ```

   ```sql
   UPDATE users SET role = 'privacy_officer' WHERE email = 'your.email@company.com';
   \q
   ```

4. **Login at:** http://localhost:5006/login

---

## 📊 Privacy Officer Dashboard

### Access Dashboard
After logging in as Privacy Officer, visit:
```
http://localhost:5006/dashboard
```

### Incident Management
- View all reported incidents
- Update incident status:
  - `reported` → New incident
  - `under_investigation` → Being investigated
  - `resolved` → Incident resolved
  - `closed` → Case closed
- Set priority (low, medium, high, critical)
- Add notes and actions
- Track OCR reporting requirements

---

## 📧 Email Notifications

### Configuration
Email notifications are sent to the Privacy Officer when:
- New incident is reported
- Incident requires OCR notification

### Setup
Edit `.env` or `docker-compose.yml`:
```bash
RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=incidents@yourdomain.com
PRIVACY_OFFICER_EMAIL=privacy.officer@yourdomain.com
```

### Testing Email
Submit a test incident via the public form to trigger notification.

---

## 🗄️ Database Access

### Connect to Database
```bash
docker exec -it incident-management-db psql -U postgres -d incident_db
```

### Useful SQL Queries

**View all users:**
```sql
SELECT id, username, email, role FROM users;
```

**View all incidents:**
```sql
SELECT id, status, priority, description, "createdAt" FROM incidents ORDER BY "createdAt" DESC;
```

**Change user role:**
```sql
UPDATE users SET role = 'privacy_officer' WHERE email = 'user@example.com';
```

**Delete test data:**
```sql
DELETE FROM incidents WHERE "reporterEmail" = 'test@example.com';
```

---

## 🔧 Troubleshooting

### Container Not Starting
```bash
# Check container status
docker-compose ps

# View logs for errors
docker logs incident-management-app
docker logs incident-management-db

# Restart containers
docker-compose restart
```

### Database Connection Issues
```bash
# Check database is healthy
docker-compose ps

# Verify database connection
docker exec incident-management-app printenv DATABASE_URL

# Recreate database schema
cd /Users/chuckw./incident-management-system
DATABASE_URL="postgresql://postgres:postgres@localhost:5441/incident_db" npm run db:push
```

### Session/Login Issues
```bash
# Clear browser cookies
# Or use incognito/private browsing mode

# Verify NODE_ENV is set correctly
docker exec incident-management-app printenv NODE_ENV
# Should show: development (for local testing)
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Default: 5006 (app), 5441 (database)

# Stop conflicting services
docker ps  # Find conflicting container
docker stop <container-id>
```

---

## 🧪 Testing

### Run Automated Tests
```bash
# See TEST_RESULTS.md for comprehensive test results
cat /Users/chuckw./incident-management-system/TEST_RESULTS.md
```

### Manual Testing Checklist
- [ ] Submit anonymous incident report
- [ ] Create user account
- [ ] Login with credentials
- [ ] Access Privacy Officer dashboard
- [ ] Update incident status
- [ ] Logout and verify session cleared
- [ ] Verify anonymous reporting still works

---

## 📁 Important Files

### Configuration
- `docker-compose.yml` - Container orchestration
- `.env.example` - Environment variable template
- `package.json` - Node.js dependencies

### Application Code
- `server/index.ts` - Main server entry point
- `server/auth.ts` - Passport authentication config
- `server/auth-routes.ts` - Auth API endpoints
- `server/routes.ts` - Main API routes
- `server/storage.ts` - Database operations
- `shared/schema.ts` - Database schema definitions

### Frontend
- `client/src/App.tsx` - Main React app
- `client/src/pages/login.tsx` - Login page
- `client/src/pages/signup.tsx` - Signup page
- `client/src/pages/dashboard.tsx` - Privacy Officer dashboard
- `client/src/pages/report-incident.tsx` - Public reporting form

---

## 🚨 HIPAA Compliance Reminders

### Critical Requirements Met
✅ Anonymous incident reporting (no authentication required)
✅ Privacy Officer email notifications
✅ OCR reporting deadline tracking (March 1)
✅ Role-based access control
✅ Audit trail (timestamps on all records)

### Before Production Deployment
⚠️ Replace MemoryStore with PostgreSQL session store
⚠️ Enable HTTPS (secure: true for cookies)
⚠️ Implement CSRF protection
⚠️ Add rate limiting
⚠️ Configure automated database backups
⚠️ Set up monitoring and alerting
⚠️ Review and update SESSION_SECRET
⚠️ Implement proper logging and audit trails

---

## 📞 Support & Documentation

### Full Test Results
See `TEST_RESULTS.md` for comprehensive testing documentation.

### Database Schema
See `shared/schema.ts` for complete database structure.

### API Documentation
See `server/routes.ts` for all available endpoints.

---

## 🎯 Next Development Phases

### Phase 2: Training Modules
- Policy training with attestation
- HIPAA 101 course
- CyberSecurity Awareness training
- Annual renewal tracking

### Phase 3: User Dashboard
- Training status dashboard
- My incidents view
- Profile management

### Phase 4: Privacy Officer Tools
- Training completion reports
- Compliance dashboard
- Enhanced OCR reporting

---

**System Status:** ✅ Phase 1 Complete - Ready for Use!
