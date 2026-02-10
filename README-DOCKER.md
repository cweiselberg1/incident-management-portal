# Docker Setup Guide for Vendor Management System

This guide will help you run the Vendor Management System locally using Docker.

## Prerequisites

- Docker installed on your system ([Download Docker](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Copy the environment file**
   ```bash
   cp .env.example .env
   ```

2. **Edit the `.env` file** with your configuration (optional for basic testing)
   - Database credentials are pre-configured for local development
   - Default port is 5005 to avoid conflicts with other applications

3. **Start the application**
   ```bash
   docker-compose up -d
   ```

   Or use the startup script:
   ```bash
   ./RUN-LOCAL.sh
   ```

4. **Initialize the database** (first time only)
   ```bash
   docker-compose exec app npm run db:push
   docker-compose restart app
   ```

5. **Access the application**
   - Open your browser to: `http://localhost:5005`

## Managing the Application

### Start the application
```bash
docker-compose up -d
# OR
./RUN-LOCAL.sh
```

### Stop the application
```bash
docker-compose down
# OR
./STOP-LOCAL.sh
```

### Stop and remove all data (including database)
```bash
docker-compose down -v
```

### Rebuild the application (after code changes)
```bash
docker-compose up -d --build
```

### View application logs
```bash
# All services
docker-compose logs -f

# Just the app
docker-compose logs -f app

# Just the database
docker-compose logs -f postgres
```

### Run database migrations
```bash
docker-compose exec app npm run db:push
```

## Environment Variables

Edit the `.env` file to configure:

- `POSTGRES_USER` - Database username (default: postgres)
- `POSTGRES_PASSWORD` - Database password (default: postgres)
- `POSTGRES_DB` - Database name (default: vendor_db)
- `POSTGRES_PORT` - Database port (default: 5439)
- `APP_PORT` - Application port (default: 5005)
- `SESSION_SECRET` - Session encryption key (change in production!)

## Services

The Docker setup includes:

1. **PostgreSQL Database** (postgres:16-alpine)
   - Port: 5439 (configurable via POSTGRES_PORT)
   - Persistent storage via Docker volume

2. **Vendor Management System** (Node.js 20)
   - Port: 5005 (configurable via APP_PORT)
   - Automatically connects to PostgreSQL
   - Health checks included
   - Persistent uploads directory
   - Attached assets volume

## Features

This Vendor Management System includes:
- Vendor registration and management
- Document upload and storage (multer)
- Vendor status tracking
- Compliance management
- Complete vendor lifecycle workflow

## Troubleshooting

### Application won't start
- Check logs: `docker-compose logs -f app`
- Ensure port 5005 is not in use: `lsof -i :5005`
- Rebuild: `docker-compose up -d --build`

### Database connection issues
- Check database logs: `docker-compose logs -f postgres`
- Verify DATABASE_URL in `.env` matches your settings
- Wait for database health check: `docker-compose ps`

### Database tables missing
This is normal on first start. Run migrations:
```bash
docker-compose exec app npm run db:push
docker-compose restart app
```

### File uploads not persisting
The uploads directory is mounted as a volume. Check:
```bash
ls -la ./uploads
docker-compose exec app ls -la /app/uploads
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec app npm run db:push
```

### Access database directly
```bash
docker-compose exec postgres psql -U postgres -d vendor_db
```

## Production Deployment

For production use:

1. Change `SESSION_SECRET` to a random, secure value
2. Use strong database passwords
3. Set up proper SSL/TLS termination (nginx, Traefik, etc.)
4. Configure appropriate resource limits
5. Set up backups for the PostgreSQL database
6. Configure proper file upload size limits
7. Set up proper file storage (S3, etc.) for production

## File Structure

```
.
├── Dockerfile              # Application container definition
├── docker-compose.yml      # Multi-container orchestration
├── .dockerignore          # Files to exclude from Docker build
├── .env.example           # Environment variables template
├── RUN-LOCAL.sh           # Quick startup script
├── STOP-LOCAL.sh          # Quick stop script
├── uploads/               # File uploads directory
└── README-DOCKER.md       # This file
```

## Default Ports

- Application: **5005** (http://localhost:5005)
- PostgreSQL: **5439**

These ports are different from the other applications to allow all apps to run simultaneously:
- Main Marketing Page: 5001 / DB: 5435
- HipaaStreamline: 5002 / DB: 5436
- Security Risk Assessment: 5003 / DB: 5437
- HIPAA-101-Training: 5004 / DB: 5438
- Vendor Management System: 5005 / DB: 5439

## Support

For issues or questions, refer to the main project documentation in `replit.md`.
