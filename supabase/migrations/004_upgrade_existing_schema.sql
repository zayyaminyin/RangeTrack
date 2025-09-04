-- Migration to upgrade existing RangeTrack database to comprehensive schema
-- This migration will work with your existing data

-- First, let's create the missing custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'manager', 'worker', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resource_type AS ENUM ('animal', 'field', 'equipment', 'feed', 'building', 'water_source', 'fence');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_type AS ENUM ('feeding', 'watering', 'herd_move', 'repair', 'harvest', 'health_check', 'vaccination', 'maintenance', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'declined', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE resource_status AS ENUM ('active', 'maintenance', 'inactive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =============================================
-- UPGRADE EXISTING TABLES
-- =============================================

-- 1. Upgrade users table to user_profiles
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Rename users to user_profiles if it exists
        ALTER TABLE public.users RENAME TO user_profiles_backup;
    END IF;
END $$;

-- Create proper user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text not null,
  avatar_url text,
  location text,
  phone text,
  timezone text default 'UTC',
  preferences jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Migrate data if backup exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_profiles_backup') THEN
        INSERT INTO public.user_profiles (id, email, full_name, location, created_at, updated_at)
        SELECT id, email, name as full_name, location, created_at, updated_at 
        FROM public.user_profiles_backup
        ON CONFLICT (id) DO NOTHING;
        
        DROP TABLE public.user_profiles_backup;
    END IF;
END $$;

-- 2. Create farms table (new)
CREATE TABLE IF NOT EXISTS public.farms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  location text,
  coordinates jsonb,
  owner_id uuid references public.user_profiles(id) on delete cascade not null,
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Upgrade existing tables to include farm_id

-- Upgrade resources table
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS farm_id uuid references public.farms(id) on delete cascade,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS unit text,
ADD COLUMN IF NOT EXISTS health_score integer,
ADD COLUMN IF NOT EXISTS coordinates jsonb,
ADD COLUMN IF NOT EXISTS metadata jsonb default '{}',
ADD COLUMN IF NOT EXISTS images text[],
ADD COLUMN IF NOT EXISTS tags text[];

-- Update resource type column if needed
DO $$
BEGIN
    -- Check if we need to update the type column
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'resources' AND column_name = 'type' 
               AND data_type != 'USER-DEFINED') THEN
        
        -- Create a new column with the enum type
        ALTER TABLE public.resources ADD COLUMN type_new resource_type;
        
        -- Update the new column based on existing values
        UPDATE public.resources SET type_new = 
            CASE 
                WHEN type = 'animal' THEN 'animal'::resource_type
                WHEN type = 'field' THEN 'field'::resource_type  
                WHEN type = 'equipment' THEN 'equipment'::resource_type
                WHEN type = 'feed' THEN 'feed'::resource_type
                ELSE 'equipment'::resource_type
            END;
            
        -- Drop old column and rename new one
        ALTER TABLE public.resources DROP COLUMN type;
        ALTER TABLE public.resources RENAME COLUMN type_new TO type;
        ALTER TABLE public.resources ALTER COLUMN type SET NOT NULL;
    END IF;
END $$;

-- Upgrade tasks table
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS farm_id uuid references public.farms(id) on delete cascade,
ADD COLUMN IF NOT EXISTS assigned_to uuid references public.user_profiles(id) on delete set null,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS unit text,
ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS due_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS estimated_duration interval,
ADD COLUMN IF NOT EXISTS actual_duration interval,
ADD COLUMN IF NOT EXISTS location text,
ADD COLUMN IF NOT EXISTS coordinates jsonb,
ADD COLUMN IF NOT EXISTS metadata jsonb default '{}',
ADD COLUMN IF NOT EXISTS images text[],
ADD COLUMN IF NOT EXISTS tags text[];

-- Rename existing columns in tasks if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'qty') THEN
        ALTER TABLE public.tasks RENAME COLUMN qty TO quantity;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'ts') THEN
        ALTER TABLE public.tasks RENAME COLUMN ts TO created_at_ts;
        ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS scheduled_at timestamp with time zone;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tasks' AND column_name = 'completed') THEN
        -- Update status based on completed boolean
        ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';
        UPDATE public.tasks SET status = CASE WHEN completed THEN 'completed' ELSE 'pending' END;
        ALTER TABLE public.tasks DROP COLUMN IF EXISTS completed;
    END IF;
END $$;

-- Update task type column if needed  
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'tasks' AND column_name = 'type' 
               AND data_type != 'USER-DEFINED') THEN
        
        ALTER TABLE public.tasks ADD COLUMN type_new task_type;
        
        UPDATE public.tasks SET type_new = 
            CASE 
                WHEN type = 'feeding' THEN 'feeding'::task_type
                WHEN type = 'watering' THEN 'watering'::task_type
                WHEN type = 'herd_move' THEN 'herd_move'::task_type
                WHEN type = 'repair' THEN 'repair'::task_type
                WHEN type = 'harvest' THEN 'harvest'::task_type
                WHEN type = 'health_check' THEN 'health_check'::task_type
                WHEN type = 'vaccination' THEN 'vaccination'::task_type
                WHEN type = 'maintenance' THEN 'maintenance'::task_type
                ELSE 'other'::task_type
            END;
            
        ALTER TABLE public.tasks DROP COLUMN type;
        ALTER TABLE public.tasks RENAME COLUMN type_new TO type;
        ALTER TABLE public.tasks ALTER COLUMN type SET NOT NULL;
    END IF;
END $$;

-- Upgrade awards table
ALTER TABLE public.awards 
ADD COLUMN IF NOT EXISTS farm_id uuid references public.farms(id) on delete cascade,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS description text,
ADD COLUMN IF NOT EXISTS icon text,
ADD COLUMN IF NOT EXISTS points integer default 0,
ADD COLUMN IF NOT EXISTS metadata jsonb default '{}';

-- Migrate awards data
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'awards' AND column_name = 'label') THEN
        UPDATE public.awards SET title = label WHERE title IS NULL;
        UPDATE public.awards SET description = reason WHERE description IS NULL;
        UPDATE public.awards SET type = 'achievement' WHERE type IS NULL;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'awards' AND column_name = 'earned_ts') THEN
        ALTER TABLE public.awards ADD COLUMN IF NOT EXISTS earned_at timestamp with time zone;
        UPDATE public.awards SET earned_at = to_timestamp(earned_ts / 1000.0) WHERE earned_at IS NULL;
    END IF;
END $$;

-- Upgrade collaborators table
ALTER TABLE public.collaborators 
ADD COLUMN IF NOT EXISTS invited_by uuid references public.user_profiles(id) on delete set null,
ADD COLUMN IF NOT EXISTS joined_at timestamp with time zone default timezone('utc'::text, now());

-- Update collaborators role if needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'collaborators' AND column_name = 'role' 
               AND data_type != 'USER-DEFINED') THEN
        
        ALTER TABLE public.collaborators ADD COLUMN role_new user_role DEFAULT 'worker';
        
        UPDATE public.collaborators SET role_new = 
            CASE 
                WHEN role = 'owner' THEN 'owner'::user_role
                WHEN role = 'manager' THEN 'manager'::user_role
                WHEN role = 'worker' THEN 'worker'::user_role
                WHEN role = 'viewer' THEN 'viewer'::user_role
                ELSE 'worker'::user_role
            END;
            
        ALTER TABLE public.collaborators DROP COLUMN role;
        ALTER TABLE public.collaborators RENAME COLUMN role_new TO role;
        ALTER TABLE public.collaborators ALTER COLUMN role SET NOT NULL;
    END IF;
END $$;

-- Upgrade invitations table  
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS message text,
ADD COLUMN IF NOT EXISTS accepted_at timestamp with time zone;

-- Update invitations status and role columns
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'invitations' AND column_name = 'status' 
               AND data_type != 'USER-DEFINED') THEN
        
        ALTER TABLE public.invitations ADD COLUMN status_new invitation_status DEFAULT 'pending';
        ALTER TABLE public.invitations DROP COLUMN status;
        ALTER TABLE public.invitations RENAME COLUMN status_new TO status;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'invitations' AND column_name = 'role' 
               AND data_type != 'USER-DEFINED') THEN
        
        ALTER TABLE public.invitations ADD COLUMN role_new user_role DEFAULT 'worker';
        ALTER TABLE public.invitations DROP COLUMN role;
        ALTER TABLE public.invitations RENAME COLUMN role_new TO role;
    END IF;
END $$;

-- =============================================
-- CREATE NEW TABLES
-- =============================================

-- Resource history
CREATE TABLE IF NOT EXISTS public.resource_history (
  id uuid default uuid_generate_v4() primary key,
  resource_id uuid references public.resources(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  old_values jsonb,
  new_values jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Task comments
CREATE TABLE IF NOT EXISTS public.task_comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  comment text not null,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activity logs
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

-- Weather data
CREATE TABLE IF NOT EXISTS public.weather_data (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  location text not null,
  coordinates jsonb not null,
  current_weather jsonb,
  forecast jsonb,
  alerts jsonb,
  fetched_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone not null
);

-- Notifications
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

-- File references
CREATE TABLE IF NOT EXISTS public.file_references (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete set null not null,
  file_name text not null,
  file_path text not null,
  file_size integer,
  mime_type text,
  entity_type text,
  entity_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a default farm for existing users and link existing data
DO $$
DECLARE
    user_record record;
    default_farm_id uuid;
BEGIN
    -- Create default farms for existing users
    FOR user_record IN SELECT * FROM public.user_profiles LOOP
        INSERT INTO public.farms (name, owner_id, description)
        VALUES (user_record.full_name || '''s Farm', user_record.id, 'Default farm created during migration')
        RETURNING id INTO default_farm_id;
        
        -- Update existing resources to belong to this farm
        UPDATE public.resources SET farm_id = default_farm_id WHERE user_id = user_record.id AND farm_id IS NULL;
        
        -- Update existing tasks to belong to this farm  
        UPDATE public.tasks SET farm_id = default_farm_id WHERE user_id = user_record.id AND farm_id IS NULL;
        
        -- Update existing awards to belong to this farm
        UPDATE public.awards SET farm_id = default_farm_id WHERE user_id = user_record.id AND farm_id IS NULL;
        
        -- Make sure user has title in tasks
        UPDATE public.tasks SET title = COALESCE(title, type::text || ' task') WHERE user_id = user_record.id AND title IS NULL;
    END LOOP;
END $$;

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON public.farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_resource_history_resource_id ON public.resource_history(resource_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON public.task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_farm_id ON public.activity_logs(farm_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_file_references_farm_id ON public.file_references(farm_id);