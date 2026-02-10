-- Incident Management System - Database Initialization
-- Run this in Supabase SQL Editor

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

-- Create admin user (cweiselberg1@gmail.com)
-- Password: TestPassword123!
INSERT INTO users (username, email, password, role)
VALUES (
  'admin',
  'cweiselberg1@gmail.com',
  '$2b$10$0i.ZSHLAIMCuQmS66JZ2Xu3ruciH2AdzUfeUmncT71nFzTmkh4mSy',
  'privacy_officer'
)
ON CONFLICT (email) DO NOTHING;

-- Create test user (thesecretmachine@gmail.com)
-- Password: TestPassword123!
INSERT INTO users (username, email, password, role)
VALUES (
  'testuser',
  'thesecretmachine@gmail.com',
  '$2b$10$0i.ZSHLAIMCuQmS66JZ2Xu3ruciH2AdzUfeUmncT71nFzTmkh4mSy',
  'privacy_officer'
)
ON CONFLICT (email) DO NOTHING;

-- Verify tables were created
SELECT 'Users table created' as status, COUNT(*) as user_count FROM users;
SELECT 'Incidents table created' as status, COUNT(*) as incident_count FROM incidents;
