# Vendor Management System

## Overview

This is a full-stack vendor management application built with React and Express.js. The system helps businesses manage vendor relationships, track business associate agreements (BAAs), store vendor documentation, and monitor risk assessments. It provides a dashboard interface for viewing vendor statistics and managing vendor profiles with document upload capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **File Uploads**: Multer middleware for handling document uploads
- **Session Management**: Express sessions with PostgreSQL store

### Project Structure
- **Monorepo Layout**: Client, server, and shared code in single repository
- **`client/`**: React frontend application
- **`server/`**: Express.js backend API
- **`shared/`**: Common TypeScript types and database schema
- **Development**: Vite dev server with HMR and Express API proxy

## Key Components

### Database Schema (Drizzle ORM)
- **Users Table**: Authentication and user management
- **Vendors Table**: Core vendor information with agreement and risk status tracking
- **Documents Table**: File metadata linked to vendors

### API Routes
- **Vendor CRUD**: Full create, read, update, delete operations
- **Document Management**: Upload, retrieve, and delete vendor documents
- **Statistics**: Dashboard metrics for vendor counts and agreement status

### Frontend Components
- **Dashboard**: Main application view with statistics and vendor table
- **Vendor Table**: Sortable, filterable table with search and status filters
- **Document Modal**: File upload and document management interface
- **Vendor Form Modal**: Create and edit vendor profiles
- **Stats Cards**: Visual metrics display for key performance indicators

## Data Flow

1. **Client Requests**: React components use TanStack Query for API calls
2. **API Processing**: Express routes handle business logic and validation
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **File Storage**: Multer handles document uploads to local filesystem
5. **State Updates**: TanStack Query invalidates and refetches data automatically

## External Dependencies

### Core Technologies
- **Database**: Neon Database (serverless PostgreSQL)
- **File Storage**: Local filesystem with configurable upload directory
- **UI Components**: Radix UI for accessible component primitives
- **Validation**: Zod schemas for type-safe data validation

### Development Tools
- **TypeScript**: Full type safety across frontend, backend, and shared code
- **ESBuild**: Fast production builds for server code
- **PostCSS**: CSS processing with Tailwind CSS

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds optimized static assets to `dist/public`
- **Backend**: ESBuild bundles server code to `dist/index.js`
- **Database**: Drizzle Kit manages schema migrations

### Production Setup
- **Static Serving**: Express serves built frontend assets
- **Environment Variables**: DATABASE_URL required for PostgreSQL connection
- **File Uploads**: Upload directory created automatically if missing
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Development Environment
- **Hot Reloading**: Vite HMR for frontend changes
- **API Proxy**: Development server proxies API requests to Express
- **Database**: Push schema changes directly with `npm run db:push`
- **Type Safety**: Shared types ensure consistency between frontend and backend