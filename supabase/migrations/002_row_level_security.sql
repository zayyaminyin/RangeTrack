-- Enable Row Level Security on all tables
alter table public.user_profiles enable row level security;
alter table public.farms enable row level security;
alter table public.collaborators enable row level security;
alter table public.invitations enable row level security;
alter table public.resources enable row level security;
alter table public.resource_history enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.awards enable row level security;
alter table public.activity_logs enable row level security;
alter table public.weather_data enable row level security;
alter table public.notifications enable row level security;
alter table public.file_references enable row level security;

-- =============================================
-- USER PROFILES POLICIES
-- =============================================

-- Users can read their own profile and profiles of farm members
create policy "Users can view own profile" on public.user_profiles
  for select using (auth.uid() = id);

-- Users can view profiles of people in their farms
create policy "Users can view farm member profiles" on public.user_profiles
  for select using (
    id in (
      select c.user_id from public.collaborators c
      where c.farm_id in (
        select farm_id from public.collaborators
        where user_id = auth.uid()
      )
    )
  );

-- Users can update their own profile
create policy "Users can update own profile" on public.user_profiles
  for update using (auth.uid() = id);

-- Users can insert their own profile (during signup)
create policy "Users can insert own profile" on public.user_profiles
  for insert with check (auth.uid() = id);

-- =============================================
-- FARMS POLICIES
-- =============================================

-- Users can view farms they own or are collaborators in
create policy "Users can view accessible farms" on public.farms
  for select using (
    owner_id = auth.uid() or
    id in (
      select farm_id from public.collaborators
      where user_id = auth.uid()
    )
  );

-- Only farm owners can update farms
create policy "Farm owners can update farms" on public.farms
  for update using (owner_id = auth.uid());

-- Users can create farms
create policy "Users can create farms" on public.farms
  for insert with check (owner_id = auth.uid());

-- Only farm owners can delete farms
create policy "Farm owners can delete farms" on public.farms
  for delete using (owner_id = auth.uid());

-- =============================================
-- COLLABORATORS POLICIES
-- =============================================

-- Users can view collaborators of farms they have access to
create policy "Users can view farm collaborators" on public.collaborators
  for select using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- Farm owners and managers can add collaborators
create policy "Owners and managers can add collaborators" on public.collaborators
  for insert with check (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid()
    ) or
    farm_id in (
      select c.farm_id from public.collaborators c
      where c.user_id = auth.uid() and c.role in ('owner', 'manager')
    )
  );

-- Farm owners and managers can remove collaborators
create policy "Owners and managers can remove collaborators" on public.collaborators
  for delete using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid()
    ) or
    farm_id in (
      select c.farm_id from public.collaborators c
      where c.user_id = auth.uid() and c.role in ('owner', 'manager')
    )
  );

-- Users can remove themselves from farms
create policy "Users can remove themselves" on public.collaborators
  for delete using (user_id = auth.uid());

-- =============================================
-- INVITATIONS POLICIES
-- =============================================

-- Users can view invitations for farms they manage
create policy "Users can view farm invitations" on public.invitations
  for select using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid()
    ) or
    farm_id in (
      select c.farm_id from public.collaborators c
      where c.user_id = auth.uid() and c.role in ('owner', 'manager')
    ) or
    email = (select email from public.user_profiles where id = auth.uid())
  );

-- Farm owners and managers can create invitations
create policy "Owners and managers can create invitations" on public.invitations
  for insert with check (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid()
    ) or
    farm_id in (
      select c.farm_id from public.collaborators c
      where c.user_id = auth.uid() and c.role in ('owner', 'manager')
    )
  );

-- Users can update invitations sent to them or that they sent
create policy "Users can update relevant invitations" on public.invitations
  for update using (
    invited_by = auth.uid() or
    email = (select email from public.user_profiles where id = auth.uid())
  );

-- =============================================
-- RESOURCES POLICIES
-- =============================================

-- Users can view resources from farms they have access to
create policy "Users can view farm resources" on public.resources
  for select using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- Users can create resources in farms they have access to
create policy "Users can create farm resources" on public.resources
  for insert with check (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- Users can update resources in farms they have write access to
create policy "Users can update farm resources" on public.resources
  for update using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid()
    ) or
    farm_id in (
      select c.farm_id from public.collaborators c
      where c.user_id = auth.uid() and c.role in ('owner', 'manager', 'worker')
    )
  );

-- Only farm owners can delete resources
create policy "Farm owners can delete resources" on public.resources
  for delete using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid()
    )
  );

-- =============================================
-- TASKS POLICIES
-- =============================================

-- Users can view tasks from farms they have access to
create policy "Users can view farm tasks" on public.tasks
  for select using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- Users can create tasks in farms they have access to
create policy "Users can create farm tasks" on public.tasks
  for insert with check (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- Users can update tasks they created or are assigned to, or if they're farm managers
create policy "Users can update relevant tasks" on public.tasks
  for update using (
    user_id = auth.uid() or
    assigned_to = auth.uid() or
    farm_id in (
      select c.farm_id from public.collaborators c
      where c.user_id = auth.uid() and c.role in ('owner', 'manager')
    )
  );

-- Users can delete tasks they created, or farm owners can delete any task
create policy "Users can delete own tasks or owners can delete any" on public.tasks
  for delete using (
    user_id = auth.uid() or
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid()
    )
  );

-- =============================================
-- TASK COMMENTS POLICIES
-- =============================================

-- Users can view comments on tasks they have access to
create policy "Users can view task comments" on public.task_comments
  for select using (
    task_id in (
      select t.id from public.tasks t
      where t.farm_id in (
        select f.id from public.farms f
        where f.owner_id = auth.uid() or
        f.id in (select farm_id from public.collaborators where user_id = auth.uid())
      )
    )
  );

-- Users can add comments to tasks they have access to
create policy "Users can add task comments" on public.task_comments
  for insert with check (
    task_id in (
      select t.id from public.tasks t
      where t.farm_id in (
        select f.id from public.farms f
        where f.owner_id = auth.uid() or
        f.id in (select farm_id from public.collaborators where user_id = auth.uid())
      )
    )
  );

-- =============================================
-- AWARDS POLICIES
-- =============================================

-- Users can view awards from farms they have access to
create policy "Users can view farm awards" on public.awards
  for select using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- System can insert awards (this will be handled by functions)
create policy "System can create awards" on public.awards
  for insert with check (true);

-- =============================================
-- ACTIVITY LOGS POLICIES
-- =============================================

-- Users can view activity logs from farms they have access to
create policy "Users can view farm activity logs" on public.activity_logs
  for select using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- System can insert activity logs
create policy "System can create activity logs" on public.activity_logs
  for insert with check (true);

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================

-- Users can only view their own notifications
create policy "Users can view own notifications" on public.notifications
  for select using (user_id = auth.uid());

-- System can create notifications
create policy "System can create notifications" on public.notifications
  for insert with check (true);

-- Users can update their own notifications (mark as read)
create policy "Users can update own notifications" on public.notifications
  for update using (user_id = auth.uid());

-- =============================================
-- WEATHER DATA POLICIES
-- =============================================

-- Users can view weather data for farms they have access to
create policy "Users can view farm weather data" on public.weather_data
  for select using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- System can manage weather data
create policy "System can manage weather data" on public.weather_data
  for all with check (true);

-- =============================================
-- FILE REFERENCES POLICIES
-- =============================================

-- Users can view file references from farms they have access to
create policy "Users can view farm files" on public.file_references
  for select using (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );

-- Users can create file references in farms they have access to
create policy "Users can upload farm files" on public.file_references
  for insert with check (
    farm_id in (
      select f.id from public.farms f
      where f.owner_id = auth.uid() or
      f.id in (select farm_id from public.collaborators where user_id = auth.uid())
    )
  );