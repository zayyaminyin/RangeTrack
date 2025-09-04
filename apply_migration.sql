-- Quick migration script to upgrade your existing RangeTrack database
-- Copy and paste this into your Supabase SQL Editor

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'manager', 'worker', 'viewer');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE resource_status AS ENUM ('active', 'maintenance', 'inactive');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Create farms table (the key missing table)
CREATE TABLE IF NOT EXISTS public.farms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  location text,
  coordinates jsonb,
  owner_id uuid not null, -- We'll add the foreign key reference after user_profiles
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Update users table to user_profiles format
ALTER TABLE public.users RENAME TO user_profiles;
ALTER TABLE public.user_profiles RENAME COLUMN name TO full_name;
ALTER TABLE public.user_profiles 
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS timezone text default 'UTC',
  ADD COLUMN IF NOT EXISTS preferences jsonb default '{}';

-- Now add the foreign key to farms
ALTER TABLE public.farms 
ADD CONSTRAINT farms_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.user_profiles(id) ON DELETE CASCADE;

-- Add farm_id to existing tables
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS farm_id uuid;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS farm_id uuid;
ALTER TABLE public.awards ADD COLUMN IF NOT EXISTS farm_id uuid;

-- Create default farms for existing users and link data
DO $$
DECLARE
    user_record record;
    default_farm_id uuid;
BEGIN
    FOR user_record IN SELECT * FROM public.user_profiles LOOP
        -- Create a default farm for each user
        INSERT INTO public.farms (name, owner_id, description)
        VALUES (
          COALESCE(user_record.full_name, 'User') || '''s Farm', 
          user_record.id, 
          'Default farm created during upgrade'
        )
        RETURNING id INTO default_farm_id;
        
        -- Link existing data to this farm
        UPDATE public.resources SET farm_id = default_farm_id WHERE user_id = user_record.id;
        UPDATE public.tasks SET farm_id = default_farm_id WHERE user_id = user_record.id;
        UPDATE public.awards SET farm_id = default_farm_id WHERE user_id = user_record.id;
    END LOOP;
END $$;

-- Make farm_id required after data migration
ALTER TABLE public.resources ALTER COLUMN farm_id SET NOT NULL;
ALTER TABLE public.tasks ALTER COLUMN farm_id SET NOT NULL;
ALTER TABLE public.awards ALTER COLUMN farm_id SET NOT NULL;

-- Add foreign key constraints
ALTER TABLE public.resources 
ADD CONSTRAINT resources_farm_id_fkey 
FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE CASCADE;

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_farm_id_fkey 
FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE CASCADE;

ALTER TABLE public.awards 
ADD CONSTRAINT awards_farm_id_fkey 
FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE CASCADE;

-- Update collaborators table if it exists but is empty
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'collaborators') THEN
        ALTER TABLE public.collaborators 
        ADD COLUMN IF NOT EXISTS invited_by uuid,
        ADD COLUMN IF NOT EXISTS joined_at timestamp with time zone default now();
        
        -- Add farm_id if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                      WHERE table_name = 'collaborators' AND column_name = 'farm_id') THEN
            ALTER TABLE public.collaborators ADD COLUMN farm_id uuid;
            
            -- Link to farms table
            ALTER TABLE public.collaborators 
            ADD CONSTRAINT collaborators_farm_id_fkey 
            FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- Create activity_logs table for better tracking
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  details jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  type text not null,
  title text not null,
  message text not null,
  data jsonb default '{}',
  read boolean default false,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add missing columns to existing tables
ALTER TABLE public.resources
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS unit text,
ADD COLUMN IF NOT EXISTS coordinates jsonb,
ADD COLUMN IF NOT EXISTS metadata jsonb default '{}',
ADD COLUMN IF NOT EXISTS images text[],
ADD COLUMN IF NOT EXISTS tags text[];

-- Rename health to health_score in resources
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'resources' AND column_name = 'health') THEN
        ALTER TABLE public.resources RENAME COLUMN health TO health_score;
    END IF;
END $$;

-- Update tasks table with new columns
ALTER TABLE public.tasks
ADD COLUMN IF NOT EXISTS assigned_to uuid references public.user_profiles(id),
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS unit text,
ADD COLUMN IF NOT EXISTS status text default 'pending',
ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS due_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS completed_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS coordinates jsonb,
ADD COLUMN IF NOT EXISTS metadata jsonb default '{}',
ADD COLUMN IF NOT EXISTS images text[],
ADD COLUMN IF NOT EXISTS tags text[];

-- Migrate existing task data
UPDATE public.tasks SET 
  title = type || ' task',
  status = CASE WHEN completed THEN 'completed' ELSE 'pending' END
WHERE title IS NULL;

-- Update awards table
ALTER TABLE public.awards
ADD COLUMN IF NOT EXISTS type text default 'achievement',
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS points integer default 0,
ADD COLUMN IF NOT EXISTS metadata jsonb default '{}',
ADD COLUMN IF NOT EXISTS earned_at timestamp with time zone;

-- Migrate awards data if old columns exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'awards' AND column_name = 'label') THEN
        UPDATE public.awards SET title = label WHERE title IS NULL;
        UPDATE public.awards SET description = reason WHERE description IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'awards' AND column_name = 'earned_ts') THEN
        UPDATE public.awards SET earned_at = to_timestamp(earned_ts / 1000.0) WHERE earned_at IS NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON public.farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_resources_farm_id ON public.resources(farm_id);
CREATE INDEX IF NOT EXISTS idx_tasks_farm_id ON public.tasks(farm_id);
CREATE INDEX IF NOT EXISTS idx_awards_farm_id ON public.awards(farm_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_farm_id ON public.activity_logs(farm_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);

-- Success message
SELECT 'Database upgrade completed successfully! You now have farms, activity logs, notifications, and enhanced tables.' as result;