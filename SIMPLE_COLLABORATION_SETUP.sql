-- Simple Collaboration Setup for RangeTrack
-- Run this in your Supabase SQL Editor

-- Create collaborators table (simplified version)
CREATE TABLE IF NOT EXISTS collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  collaborator_email TEXT NOT NULL,
  collaborator_name TEXT,
  role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('owner', 'manager', 'worker', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'invited')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitations table (simplified version)
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'worker' CHECK (role IN ('manager', 'worker', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaborators_email ON collaborators(collaborator_email);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_invited_by ON invitations(invited_by);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON invitations(status);

-- Enable Row Level Security
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaborators
CREATE POLICY "Users can view own collaborators" ON collaborators
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own collaborators" ON collaborators
FOR ALL USING (user_id = auth.uid());

-- RLS Policies for invitations
CREATE POLICY "Users can view own sent invitations" ON invitations
FOR SELECT USING (invited_by = auth.uid());

CREATE POLICY "Users can manage own invitations" ON invitations
FOR ALL USING (invited_by = auth.uid());

CREATE POLICY "Users can view invitations sent to their email" ON invitations
FOR SELECT USING (email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));

-- Function to accept invitation (simplified)
CREATE OR REPLACE FUNCTION accept_invitation_simple(
  p_invitation_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get invitation details
  SELECT * INTO invitation_record 
  FROM invitations 
  WHERE id = p_invitation_id 
  AND email = (SELECT email FROM auth.users WHERE id = auth.uid())
  AND status = 'pending'
  AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Add user as collaborator
  INSERT INTO collaborators (user_id, collaborator_email, collaborator_name, role, status, joined_at)
  VALUES (auth.uid(), invitation_record.email, (SELECT name FROM auth.users WHERE id = auth.uid()), invitation_record.role, 'active', NOW());
  
  -- Update invitation status
  UPDATE invitations 
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_invitation_id;
  
  RETURN TRUE;
END;
$$;

-- Insert some test data (optional)
-- INSERT INTO collaborators (user_id, collaborator_email, collaborator_name, role, status, joined_at)
-- VALUES 
--   (auth.uid(), 'john@farm.com', 'John Smith', 'manager', 'active', NOW()),
--   (auth.uid(), 'sarah@ranch.com', 'Sarah Johnson', 'worker', 'active', NOW());

-- INSERT INTO invitations (email, role, invited_by, message)
-- VALUES 
--   ('mike@farm.com', 'worker', auth.uid(), 'Join our farm team!');
