-- Fix RLS Policies for Collaboration Tables
-- Run this in your Supabase SQL Editor

-- First, let's check if the policies exist and drop them if needed
DROP POLICY IF EXISTS "Users can view own collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can manage own collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can view own sent invitations" ON invitations;
DROP POLICY IF EXISTS "Users can manage own invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON invitations;

-- Recreate the policies with proper permissions
CREATE POLICY "Users can view own collaborators" ON collaborators
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own collaborators" ON collaborators
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own sent invitations" ON invitations
FOR SELECT USING (invited_by = auth.uid());

CREATE POLICY "Users can manage own invitations" ON invitations
FOR ALL USING (invited_by = auth.uid());

CREATE POLICY "Users can view invitations sent to their email" ON invitations
FOR SELECT USING (email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

-- Also, let's make sure the users table has proper RLS policies
-- (This might be the source of the "permission denied for table users" error)
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

CREATE POLICY "Users can view own profile" ON users
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
FOR UPDATE USING (id = auth.uid());

-- Enable RLS on all tables if not already enabled
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
