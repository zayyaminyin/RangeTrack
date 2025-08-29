-- Simple RLS Fix - No users table references
-- Run this in your Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can manage own collaborators" ON collaborators;
DROP POLICY IF EXISTS "Users can view own sent invitations" ON invitations;
DROP POLICY IF EXISTS "Users can manage own invitations" ON invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to their email" ON invitations;

-- Create simple policies without users table references
CREATE POLICY "Users can view own collaborators" ON collaborators
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own collaborators" ON collaborators
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view own sent invitations" ON invitations
FOR SELECT USING (invited_by = auth.uid());

CREATE POLICY "Users can manage own invitations" ON invitations
FOR ALL USING (invited_by = auth.uid());

-- Simple policy for viewing invitations by email (without users table join)
CREATE POLICY "Users can view invitations by email" ON invitations
FOR SELECT USING (true); -- Allow all users to view invitations (we'll filter in the app)

-- Enable RLS
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
