# Multi-stage build for Vendor Management System
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Patch db.ts to use standard PostgreSQL instead of Neon BEFORE building
RUN sed -i "s/import { Pool, neonConfig } from '@neondatabase\/serverless';/import pg from 'pg';\nconst { Pool } = pg;/g" /app/server/db.ts && \
    sed -i "s/from 'drizzle-orm\/neon-serverless'/from 'drizzle-orm\/node-postgres'/g" /app/server/db.ts && \
    sed -i '/neonConfig.webSocketConstructor/d' /app/server/db.ts && \
    sed -i '/import ws from "ws"/d' /app/server/db.ts && \
    sed -i "s/drizzle({ client: pool, schema })/drizzle(pool, { schema })/g" /app/server/db.ts

# Install pg package
RUN npm install pg

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install all dependencies (Vite is needed at runtime)
COPY package*.json ./
RUN npm ci && npm install pg

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client ./client
COPY --from=builder /app/server ./server
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/attached_assets ./attached_assets
COPY --from=builder /app/uploads ./uploads
COPY --from=builder /app/drizzle.config.ts ./drizzle.config.ts

# Expose the application port
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["npm", "run", "start"]
