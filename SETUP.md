# RangeTrack Setup Guide

## Supabase Configuration

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Create a new project
3. Wait for the project to be set up

### 2. Set Up Database Tables

Run the following SQL in your Supabase SQL Editor:

```sql
-- Create users table
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create resources table
CREATE TABLE resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('animal', 'field', 'equipment', 'feed')) NOT NULL,
  name TEXT NOT NULL,
  quantity INTEGER,
  status TEXT,
  health INTEGER,
  last_checked TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('feeding', 'watering', 'herd_move', 'repair', 'harvest', 'health_check', 'vaccination', 'maintenance', 'other')) NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  qty INTEGER,
  notes TEXT,
  ts BIGINT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  image TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create awards table
CREATE TABLE awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  reason TEXT NOT NULL,
  earned_ts BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own resources" ON resources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own resources" ON resources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own resources" ON resources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own resources" ON resources FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tasks" ON tasks FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own awards" ON awards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own awards" ON awards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own awards" ON awards FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (id, email, name, location)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'location', 'Unknown Location')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3. Configure Environment Variables

1. Create a `.env` file in the root directory
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase project settings under "API".

### 4. Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:5173` for development)
3. Add any additional redirect URLs as needed

### 5. Install Dependencies and Run

```bash
npm install
npm run dev
```

## Features Added

### Authentication
- ✅ User registration and login
- ✅ Password reset functionality
- ✅ Session management
- ✅ Protected routes

### Data Storage
- ✅ Supabase database integration
- ✅ Real-time data synchronization
- ✅ User-specific data isolation
- ✅ CRUD operations for all entities

### Backend Services
- ✅ Authentication service
- ✅ Data service for resources, tasks, and awards
- ✅ Analytics and insights
- ✅ Error handling and loading states

### Security
- ✅ Row Level Security (RLS) policies
- ✅ User data isolation
- ✅ Secure authentication flow
- ✅ Environment variable protection

## Database Schema

### Users Table
- `id`: UUID (references auth.users)
- `email`: User's email address
- `name`: User's full name
- `location`: Farm/ranch location
- `created_at`, `updated_at`: Timestamps

### Resources Table
- `id`: UUID primary key
- `user_id`: References users table
- `type`: animal, field, equipment, or feed
- `name`: Resource name
- `quantity`: Numeric quantity
- `status`: Current status
- `health`: Health score (0-100)
- `notes`: Additional notes
- `image`: Optional image URL

### Tasks Table
- `id`: UUID primary key
- `user_id`: References users table
- `type`: Task type (feeding, watering, etc.)
- `resource_id`: Optional reference to resource
- `qty`: Quantity used/processed
- `notes`: Task notes
- `ts`: Timestamp
- `completed`: Completion status
- `priority`: low, medium, or high

### Awards Table
- `id`: UUID primary key
- `user_id`: References users table
- `label`: Award name
- `reason`: Why the award was earned
- `earned_ts`: When it was earned

## Next Steps

1. Set up your Supabase project using the SQL above
2. Configure your environment variables
3. Test the authentication flow
4. Start adding your farm data!

The app now has full backend functionality with secure authentication and data persistence.
