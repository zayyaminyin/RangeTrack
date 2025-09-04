-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create custom types
create type user_role as enum ('owner', 'manager', 'worker', 'viewer');
create type resource_type as enum ('animal', 'field', 'equipment', 'feed', 'building', 'water_source', 'fence');
create type task_type as enum ('feeding', 'watering', 'herd_move', 'repair', 'harvest', 'health_check', 'vaccination', 'maintenance', 'other');
create type task_priority as enum ('low', 'medium', 'high');
create type invitation_status as enum ('pending', 'accepted', 'declined', 'expired');
create type resource_status as enum ('active', 'maintenance', 'inactive');

-- =============================================
-- USERS AND AUTHENTICATION
-- =============================================

-- User profiles (extends auth.users)
create table public.user_profiles (
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

-- =============================================
-- FARM MANAGEMENT
-- =============================================

-- Farms/Organizations
create table public.farms (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  location text,
  coordinates jsonb, -- {lat: number, lng: number}
  owner_id uuid references public.user_profiles(id) on delete cascade not null,
  settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Farm collaborators (many-to-many relationship)
create table public.collaborators (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  role user_role not null default 'worker',
  invited_by uuid references public.user_profiles(id) on delete set null,
  joined_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(farm_id, user_id)
);

-- Invitations
create table public.invitations (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  email text not null,
  role user_role not null default 'worker',
  invited_by uuid references public.user_profiles(id) on delete cascade not null,
  message text,
  status invitation_status default 'pending',
  expires_at timestamp with time zone not null,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(farm_id, email)
);

-- =============================================
-- FARM RESOURCES
-- =============================================

-- Resources (animals, equipment, fields, etc.)
create table public.resources (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete set null not null, -- who created it
  type resource_type not null,
  name text not null,
  description text,
  quantity numeric,
  unit text, -- kg, liters, head, acres, etc.
  status resource_status default 'active',
  health_score integer check (health_score >= 0 and health_score <= 100),
  last_checked timestamp with time zone,
  location text,
  coordinates jsonb, -- {lat: number, lng: number}
  notes text,
  metadata jsonb default '{}', -- flexible field for type-specific data
  images text[], -- array of image URLs
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Resource history (for tracking changes)
create table public.resource_history (
  id uuid default uuid_generate_v4() primary key,
  resource_id uuid references public.resources(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete set null,
  action text not null, -- 'created', 'updated', 'deleted', 'health_check', etc.
  old_values jsonb,
  new_values jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- TASKS AND ACTIVITIES
-- =============================================

-- Tasks
create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete set null not null, -- who created it
  assigned_to uuid references public.user_profiles(id) on delete set null, -- who is responsible
  resource_id uuid references public.resources(id) on delete set null,
  type task_type not null,
  title text not null,
  description text,
  quantity numeric,
  unit text,
  priority task_priority default 'medium',
  status text default 'pending', -- pending, in_progress, completed, cancelled
  scheduled_at timestamp with time zone,
  due_date timestamp with time zone,
  completed_at timestamp with time zone,
  estimated_duration interval, -- how long the task should take
  actual_duration interval, -- how long it actually took
  location text,
  coordinates jsonb,
  notes text,
  metadata jsonb default '{}',
  images text[],
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Task comments/updates
create table public.task_comments (
  id uuid default uuid_generate_v4() primary key,
  task_id uuid references public.tasks(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  comment text not null,
  images text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- ACHIEVEMENTS AND ANALYTICS
-- =============================================

-- Awards/Achievements
create table public.awards (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  type text not null, -- 'productivity', 'consistency', 'milestone', etc.
  title text not null,
  description text not null,
  icon text,
  points integer default 0,
  metadata jsonb default '{}',
  earned_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Activity logs (for analytics)
create table public.activity_logs (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete set null,
  action text not null,
  entity_type text not null, -- 'task', 'resource', 'farm', etc.
  entity_id uuid,
  details jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- WEATHER AND EXTERNAL DATA
-- =============================================

-- Weather data cache
create table public.weather_data (
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

-- =============================================
-- NOTIFICATIONS
-- =============================================

-- Notifications
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  type text not null, -- 'task_due', 'task_completed', 'resource_alert', etc.
  title text not null,
  message text not null,
  data jsonb default '{}',
  read boolean default false,
  read_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- FILE STORAGE REFERENCES
-- =============================================

-- File references (for tracking uploaded files)
create table public.file_references (
  id uuid default uuid_generate_v4() primary key,
  farm_id uuid references public.farms(id) on delete cascade not null,
  user_id uuid references public.user_profiles(id) on delete set null not null,
  file_name text not null,
  file_path text not null, -- path in Supabase storage
  file_size integer,
  mime_type text,
  entity_type text, -- 'task', 'resource', 'profile', etc.
  entity_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles
create index idx_user_profiles_email on public.user_profiles(email);

-- Farms
create index idx_farms_owner_id on public.farms(owner_id);
create index idx_farms_created_at on public.farms(created_at desc);

-- Collaborators
create index idx_collaborators_farm_id on public.collaborators(farm_id);
create index idx_collaborators_user_id on public.collaborators(user_id);

-- Invitations
create index idx_invitations_farm_id on public.invitations(farm_id);
create index idx_invitations_email on public.invitations(email);
create index idx_invitations_status on public.invitations(status);

-- Resources
create index idx_resources_farm_id on public.resources(farm_id);
create index idx_resources_type on public.resources(type);
create index idx_resources_status on public.resources(status);
create index idx_resources_created_at on public.resources(created_at desc);

-- Tasks
create index idx_tasks_farm_id on public.tasks(farm_id);
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_assigned_to on public.tasks(assigned_to);
create index idx_tasks_resource_id on public.tasks(resource_id);
create index idx_tasks_type on public.tasks(type);
create index idx_tasks_status on public.tasks(status);
create index idx_tasks_scheduled_at on public.tasks(scheduled_at);
create index idx_tasks_due_date on public.tasks(due_date);
create index idx_tasks_created_at on public.tasks(created_at desc);

-- Awards
create index idx_awards_farm_id on public.awards(farm_id);
create index idx_awards_user_id on public.awards(user_id);
create index idx_awards_earned_at on public.awards(earned_at desc);

-- Activity logs
create index idx_activity_logs_farm_id on public.activity_logs(farm_id);
create index idx_activity_logs_user_id on public.activity_logs(user_id);
create index idx_activity_logs_created_at on public.activity_logs(created_at desc);

-- Notifications
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_notifications_read on public.notifications(read);
create index idx_notifications_created_at on public.notifications(created_at desc);