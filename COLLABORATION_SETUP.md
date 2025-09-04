# Collaboration Feature Setup Guide

This guide will help you set up the collaboration feature in Supabase to enable team management and invitations.

## 1. Database Tables Setup

Run these SQL commands in your Supabase SQL Editor:

### Create Collaborators Table
```sql
CREATE TABLE collaborators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'manager', 'worker', 'viewer')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'invited')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_collaborators_farm_id ON collaborators(farm_id);
CREATE INDEX idx_collaborators_user_id ON collaborators(user_id);
CREATE INDEX idx_collaborators_status ON collaborators(status);
```

### Create Invitations Table
```sql
CREATE TABLE invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('manager', 'worker', 'viewer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  invited_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_invitations_farm_id ON invitations(farm_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_status ON invitations(status);
CREATE INDEX idx_invitations_expires_at ON invitations(expires_at);
```

### Create Farms Table (if you want to support multiple farms per user)
```sql
CREATE TABLE farms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_farms_owner_id ON farms(owner_id);
```

## 2. Row Level Security (RLS) Policies

### Enable RLS on all tables
```sql
ALTER TABLE collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
```

### Collaborators Policies
```sql
-- Users can view collaborators for farms they're part of
CREATE POLICY "Users can view farm collaborators" ON collaborators
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM collaborators c2 
    WHERE c2.farm_id = collaborators.farm_id 
    AND c2.user_id = auth.uid()
  )
);

-- Farm owners can manage collaborators
CREATE POLICY "Farm owners can manage collaborators" ON collaborators
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM farms f 
    WHERE f.id = collaborators.farm_id 
    AND f.owner_id = auth.uid()
  )
);

-- Users can update their own collaborator record
CREATE POLICY "Users can update own collaborator record" ON collaborators
FOR UPDATE USING (user_id = auth.uid());
```

### Invitations Policies
```sql
-- Users can view invitations for farms they own
CREATE POLICY "Farm owners can view invitations" ON invitations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM farms f 
    WHERE f.id = invitations.farm_id 
    AND f.owner_id = auth.uid()
  )
);

-- Farm owners can manage invitations
CREATE POLICY "Farm owners can manage invitations" ON invitations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM farms f 
    WHERE f.id = invitations.farm_id 
    AND f.owner_id = auth.uid()
  )
);

-- Users can view invitations sent to their email
CREATE POLICY "Users can view own invitations" ON invitations
FOR SELECT USING (email = (
  SELECT email FROM auth.users WHERE id = auth.uid()
));
```

### Farms Policies
```sql
-- Users can view farms they own or collaborate on
CREATE POLICY "Users can view accessible farms" ON farms
FOR SELECT USING (
  owner_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM collaborators c 
    WHERE c.farm_id = farms.id 
    AND c.user_id = auth.uid()
  )
);

-- Only farm owners can manage farms
CREATE POLICY "Farm owners can manage farms" ON farms
FOR ALL USING (owner_id = auth.uid());
```

## 3. Database Functions

### Function to create a new farm and add owner as collaborator
```sql
CREATE OR REPLACE FUNCTION create_farm_with_owner(
  farm_name TEXT,
  farm_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_farm_id UUID;
BEGIN
  -- Create the farm
  INSERT INTO farms (name, description, owner_id)
  VALUES (farm_name, farm_description, auth.uid())
  RETURNING id INTO new_farm_id;
  
  -- Add the creator as owner collaborator
  INSERT INTO collaborators (farm_id, user_id, role, status, joined_at)
  VALUES (new_farm_id, auth.uid(), 'owner', 'active', NOW());
  
  RETURN new_farm_id;
END;
$$;
```

### Function to send invitation
```sql
CREATE OR REPLACE FUNCTION send_invitation(
  p_farm_id UUID,
  p_email TEXT,
  p_role TEXT,
  p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_invitation_id UUID;
BEGIN
  -- Check if user has permission to invite (is farm owner)
  IF NOT EXISTS (
    SELECT 1 FROM farms 
    WHERE id = p_farm_id AND owner_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Permission denied: Only farm owners can send invitations';
  END IF;
  
  -- Check if user is already a collaborator
  IF EXISTS (
    SELECT 1 FROM collaborators 
    WHERE farm_id = p_farm_id AND user_id = (
      SELECT id FROM auth.users WHERE email = p_email
    )
  ) THEN
    RAISE EXCEPTION 'User is already a collaborator on this farm';
  END IF;
  
  -- Create invitation
  INSERT INTO invitations (farm_id, email, role, invited_by, message)
  VALUES (p_farm_id, p_email, p_role, auth.uid(), p_message)
  RETURNING id INTO new_invitation_id;
  
  RETURN new_invitation_id;
END;
$$;
```

### Function to accept invitation
```sql
CREATE OR REPLACE FUNCTION accept_invitation(
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
  INSERT INTO collaborators (farm_id, user_id, role, status, joined_at)
  VALUES (invitation_record.farm_id, auth.uid(), invitation_record.role, 'active', NOW());
  
  -- Update invitation status
  UPDATE invitations 
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_invitation_id;
  
  RETURN TRUE;
END;
$$;
```

## 4. Update Existing Tables

### Add farm_id to existing tables (if you want to support multiple farms)
```sql
-- Add farm_id column to existing tables
ALTER TABLE resources ADD COLUMN farm_id UUID REFERENCES farms(id);
ALTER TABLE tasks ADD COLUMN farm_id UUID REFERENCES farms(id);
ALTER TABLE awards ADD COLUMN farm_id UUID REFERENCES farms(id);

-- Update existing data to assign to a default farm
-- (You'll need to create a default farm first)
UPDATE resources SET farm_id = (SELECT id FROM farms WHERE owner_id = auth.uid() LIMIT 1);
UPDATE tasks SET farm_id = (SELECT id FROM farms WHERE owner_id = auth.uid() LIMIT 1);
UPDATE awards SET farm_id = (SELECT id FROM farms WHERE owner_id = auth.uid() LIMIT 1);

-- Make farm_id NOT NULL after updating existing data
ALTER TABLE resources ALTER COLUMN farm_id SET NOT NULL;
ALTER TABLE tasks ALTER COLUMN farm_id SET NOT NULL;
ALTER TABLE awards ALTER COLUMN farm_id SET NOT NULL;
```

## 5. Email Integration (Optional)

To send actual invitation emails, you can use Supabase's built-in email service or integrate with a third-party service like SendGrid.

### Using Supabase Edge Functions for Email
Create an edge function to send invitation emails:

```typescript
// supabase/functions/send-invitation/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { invitationId } = await req.json()
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Get invitation details
  const { data: invitation } = await supabase
    .from('invitations')
    .select(`
      *,
      farms(name),
      invited_by:auth.users(name, email)
    `)
    .eq('id', invitationId)
    .single()
  
  // Send email using your preferred email service
  // Example with SendGrid, Resend, or Supabase's built-in email
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
```

## 6. Frontend Integration

Update your TypeScript types in `src/lib/supabase.ts`:

```typescript
export interface Database {
  public: {
    Tables: {
      // ... existing tables
      collaborators: {
        Row: {
          id: string
          farm_id: string
          user_id: string
          role: 'owner' | 'manager' | 'worker' | 'viewer'
          status: 'active' | 'pending' | 'invited'
          invited_at: string | null
          joined_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          user_id: string
          role: 'owner' | 'manager' | 'worker' | 'viewer'
          status?: 'active' | 'pending' | 'invited'
          invited_at?: string | null
          joined_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          user_id?: string
          role?: 'owner' | 'manager' | 'worker' | 'viewer'
          status?: 'active' | 'pending' | 'invited'
          invited_at?: string | null
          joined_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invitations: {
        Row: {
          id: string
          farm_id: string
          email: string
          role: 'manager' | 'worker' | 'viewer'
          status: 'pending' | 'accepted' | 'expired'
          invited_by: string
          invited_at: string
          expires_at: string
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farm_id: string
          email: string
          role: 'manager' | 'worker' | 'viewer'
          status?: 'pending' | 'accepted' | 'expired'
          invited_by: string
          invited_at?: string
          expires_at?: string
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farm_id?: string
          email?: string
          role?: 'manager' | 'worker' | 'viewer'
          status?: 'pending' | 'accepted' | 'expired'
          invited_by?: string
          invited_at?: string
          expires_at?: string
          message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      farms: {
        Row: {
          id: string
          name: string
          description: string | null
          owner_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          owner_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          owner_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Functions: {
      create_farm_with_owner: {
        Args: {
          farm_name: string
          farm_description?: string
        }
        Returns: string
      }
      send_invitation: {
        Args: {
          p_farm_id: string
          p_email: string
          p_role: string
          p_message?: string
        }
        Returns: string
      }
      accept_invitation: {
        Args: {
          p_invitation_id: string
        }
        Returns: boolean
      }
    }
  }
}
```

## 7. Testing the Setup

1. **Create a test farm**: Use the `create_farm_with_owner` function
2. **Send an invitation**: Use the `send_invitation` function
3. **Accept an invitation**: Use the `accept_invitation` function
4. **Test RLS policies**: Verify that users can only access data they should have access to

## 8. Next Steps

1. Implement the data service functions in your frontend
2. Add email sending functionality
3. Create invitation acceptance flow
4. Add role-based access control to your existing components
5. Implement farm switching if supporting multiple farms

This setup provides a solid foundation for collaboration features while maintaining security through RLS policies.
