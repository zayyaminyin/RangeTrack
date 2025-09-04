# RangeTrack Supabase Setup Guide

This guide will help you set up Supabase for the RangeTrack farm management application.

## Prerequisites

1. **Supabase CLI** - Install the Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. **Docker** - Required for local development (optional but recommended)

## Option 1: Local Development Setup

### 1. Initialize Supabase Local Environment

```bash
# Navigate to your project directory
cd /path/to/RangeTrack

# Start Supabase local services
supabase start
```

This will start:
- PostgreSQL database (port 54322)
- API server (port 54321) 
- Studio dashboard (port 54323)
- Inbucket email testing (port 54324)

### 2. Apply Database Migrations

```bash
# Apply all migrations in order
supabase db reset

# Or apply them individually:
# supabase db push --file supabase/migrations/001_initial_schema.sql
# supabase db push --file supabase/migrations/002_row_level_security.sql  
# supabase db push --file supabase/migrations/003_functions_and_triggers.sql
```

### 3. Access Local Dashboard

Open http://localhost:54323 to access Supabase Studio locally.

## Option 2: Production Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the database to be provisioned

### 2. Link Your Project

```bash
# Link to your Supabase project
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

### 3. Push Migrations to Production

```bash
# Push migrations to production
supabase db push
```

## Environment Variables Setup

Create a `.env.local` file in your project root:

```env
# For local development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_anon_key

# For production (replace with your actual values)
# VITE_SUPABASE_URL=https://your-project-ref.supabase.co
# VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

**Note**: The local anon key can be found when you run `supabase start` - it will be displayed in the terminal output.

## Database Schema Overview

The RangeTrack database includes the following main tables:

### Core Tables
- **`user_profiles`** - Extended user information
- **`farms`** - Farm/organization data
- **`collaborators`** - Multi-user farm access
- **`invitations`** - Team invitation system

### Farm Management
- **`resources`** - Animals, equipment, fields, feed, etc.
- **`resource_history`** - Change tracking
- **`tasks`** - Farm tasks and activities
- **`task_comments`** - Task collaboration

### Features
- **`awards`** - Achievement system
- **`activity_logs`** - Audit trail
- **`notifications`** - User notifications
- **`weather_data`** - Cached weather information
- **`file_references`** - File upload tracking

## Key Features Implemented

### 1. **Row Level Security (RLS)**
- All tables have comprehensive RLS policies
- Users can only access data from farms they belong to
- Role-based permissions (owner, manager, worker, viewer)

### 2. **Database Functions**
- `accept_invitation()` - Join a farm via invitation
- `get_farm_analytics()` - Comprehensive analytics
- `log_activity()` - Activity logging
- `create_notification()` - Notification system

### 3. **Triggers**
- Automatic `updated_at` timestamp updates
- User profile creation on signup
- Resource change history tracking
- Activity logging
- Achievement checking
- Notification creation

### 4. **Authentication Flow**
- User registration automatically creates profile
- Email-based authentication
- OAuth providers can be enabled in config

## File Storage Setup

To enable file uploads for images:

```bash
# Create storage buckets
supabase storage create-bucket farm-images --public
supabase storage create-bucket task-images --public
supabase storage create-bucket profile-avatars --public
```

### Storage Policies

Add these policies in Supabase Studio or via SQL:

```sql
-- Allow authenticated users to upload to their farm's folders
create policy "Users can upload farm images" on storage.objects for insert with check (
  auth.role() = 'authenticated' and
  bucket_id = 'farm-images' and
  (storage.foldername(name))[1] in (
    select f.id::text from farms f 
    where f.owner_id = auth.uid() or 
    f.id in (select farm_id from collaborators where user_id = auth.uid())
  )
);

-- Allow authenticated users to view farm images
create policy "Users can view farm images" on storage.objects for select using (
  auth.role() = 'authenticated' and
  bucket_id = 'farm-images' and
  (storage.foldername(name))[1] in (
    select f.id::text from farms f 
    where f.owner_id = auth.uid() or 
    f.id in (select farm_id from collaborators where user_id = auth.uid())
  )
);
```

## Testing the Setup

1. **Start the application**:
   ```bash
   npm run dev
   ```

2. **Register a new user** - Should automatically create user profile

3. **Create a farm** - Test the farm creation process

4. **Invite collaborators** - Test the invitation system

5. **Add resources and tasks** - Test core functionality

6. **Check analytics** - Visit reports section

## Troubleshooting

### Common Issues

1. **Migration Errors**
   ```bash
   # Reset local database completely
   supabase db reset --linked false
   ```

2. **Permission Errors**
   - Check RLS policies are correctly applied
   - Verify user has proper role in collaborators table

3. **Environment Variables**
   - Ensure `.env.local` file is properly configured
   - Restart development server after changing env vars

### Useful Commands

```bash
# Check database status
supabase status

# View database logs
supabase logs db

# Generate TypeScript types
supabase gen types typescript --local > src/types/supabase.ts

# Create new migration
supabase migration new migration_name
```

## Production Deployment

When ready to deploy:

1. Push migrations to production:
   ```bash
   supabase db push
   ```

2. Update environment variables in your hosting platform

3. Enable authentication providers as needed

4. Set up proper backup schedule in Supabase dashboard

5. Configure custom SMTP for email sending (optional)

## Security Considerations

- All tables use Row Level Security
- API keys should never be committed to code
- Use environment variables for sensitive data
- Regularly review and audit database permissions
- Enable 2FA on your Supabase account
- Monitor activity logs for suspicious behavior

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Database Functions](https://supabase.com/docs/guides/database/functions)