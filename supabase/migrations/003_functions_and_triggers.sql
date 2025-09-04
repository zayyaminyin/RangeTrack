-- =============================================
-- UTILITY FUNCTIONS
-- =============================================

-- Function to update the updated_at column
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

-- User profiles
create trigger update_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.update_updated_at_column();

-- Farms
create trigger update_farms_updated_at
  before update on public.farms
  for each row execute procedure public.update_updated_at_column();

-- Resources
create trigger update_resources_updated_at
  before update on public.resources
  for each row execute procedure public.update_updated_at_column();

-- Tasks
create trigger update_tasks_updated_at
  before update on public.tasks
  for each row execute procedure public.update_updated_at_column();

-- =============================================
-- USER MANAGEMENT FUNCTIONS
-- =============================================

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user registration
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- RESOURCE HISTORY TRACKING
-- =============================================

-- Function to track resource changes
create or replace function public.track_resource_changes()
returns trigger as $$
begin
  if tg_op = 'UPDATE' then
    insert into public.resource_history (resource_id, user_id, action, old_values, new_values)
    values (
      new.id,
      auth.uid(),
      'updated',
      to_jsonb(old),
      to_jsonb(new)
    );
    return new;
  elsif tg_op = 'INSERT' then
    insert into public.resource_history (resource_id, user_id, action, new_values)
    values (
      new.id,
      auth.uid(),
      'created',
      to_jsonb(new)
    );
    return new;
  elsif tg_op = 'DELETE' then
    insert into public.resource_history (resource_id, user_id, action, old_values)
    values (
      old.id,
      auth.uid(),
      'deleted',
      to_jsonb(old)
    );
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- Triggers for resource history
create trigger track_resource_changes_trigger
  after insert or update or delete on public.resources
  for each row execute procedure public.track_resource_changes();

-- =============================================
-- ACTIVITY LOGGING
-- =============================================

-- Function to log activities
create or replace function public.log_activity(
  p_farm_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id uuid default null,
  p_details jsonb default '{}'
)
returns uuid as $$
declare
  activity_id uuid;
begin
  insert into public.activity_logs (farm_id, user_id, action, entity_type, entity_id, details)
  values (p_farm_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_details)
  returning id into activity_id;
  
  return activity_id;
end;
$$ language plpgsql security definer;

-- Function to automatically log task completion
create or replace function public.log_task_completion()
returns trigger as $$
begin
  -- Check if task was just completed
  if old.status != 'completed' and new.status = 'completed' then
    perform public.log_activity(
      new.farm_id,
      'task_completed',
      'task',
      new.id,
      jsonb_build_object(
        'task_type', new.type,
        'task_title', new.title,
        'completed_by', auth.uid(),
        'duration', extract(epoch from (new.completed_at - new.created_at))
      )
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for task completion logging
create trigger log_task_completion_trigger
  after update on public.tasks
  for each row execute procedure public.log_task_completion();

-- =============================================
-- NOTIFICATION FUNCTIONS
-- =============================================

-- Function to create notification
create or replace function public.create_notification(
  p_farm_id uuid,
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_data jsonb default '{}'
)
returns uuid as $$
declare
  notification_id uuid;
begin
  insert into public.notifications (farm_id, user_id, type, title, message, data)
  values (p_farm_id, p_user_id, p_type, p_title, p_message, p_data)
  returning id into notification_id;
  
  return notification_id;
end;
$$ language plpgsql security definer;

-- Function to notify task assignment
create or replace function public.notify_task_assignment()
returns trigger as $$
begin
  -- Notify when a task is assigned to someone
  if new.assigned_to is not null and (old.assigned_to is null or old.assigned_to != new.assigned_to) then
    perform public.create_notification(
      new.farm_id,
      new.assigned_to,
      'task_assigned',
      'New Task Assigned',
      'You have been assigned a new task: ' || new.title,
      jsonb_build_object(
        'task_id', new.id,
        'task_type', new.type,
        'assigned_by', auth.uid()
      )
    );
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for task assignment notifications
create trigger notify_task_assignment_trigger
  after insert or update on public.tasks
  for each row execute procedure public.notify_task_assignment();

-- =============================================
-- INVITATION FUNCTIONS
-- =============================================

-- Function to accept invitation
create or replace function public.accept_invitation(p_invitation_id uuid)
returns jsonb as $$
declare
  invitation_record public.invitations;
  user_email text;
  result jsonb;
begin
  -- Get current user email
  select email into user_email
  from public.user_profiles
  where id = auth.uid();
  
  if user_email is null then
    return jsonb_build_object('success', false, 'error', 'User not found');
  end if;
  
  -- Get invitation
  select * into invitation_record
  from public.invitations
  where id = p_invitation_id
  and email = user_email
  and status = 'pending'
  and expires_at > now();
  
  if not found then
    return jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  end if;
  
  -- Check if user is already a collaborator
  if exists (
    select 1 from public.collaborators
    where farm_id = invitation_record.farm_id
    and user_id = auth.uid()
  ) then
    -- Update invitation status
    update public.invitations
    set status = 'accepted', accepted_at = now()
    where id = p_invitation_id;
    
    return jsonb_build_object('success', true, 'message', 'Already a member');
  end if;
  
  -- Add user as collaborator
  insert into public.collaborators (farm_id, user_id, role, invited_by)
  values (
    invitation_record.farm_id,
    auth.uid(),
    invitation_record.role,
    invitation_record.invited_by
  );
  
  -- Update invitation status
  update public.invitations
  set status = 'accepted', accepted_at = now()
  where id = p_invitation_id;
  
  -- Create welcome notification
  perform public.create_notification(
    invitation_record.farm_id,
    auth.uid(),
    'welcome',
    'Welcome to the farm!',
    'You have successfully joined the farm team.',
    jsonb_build_object('farm_id', invitation_record.farm_id)
  );
  
  return jsonb_build_object('success', true, 'message', 'Successfully joined the farm');
end;
$$ language plpgsql security definer;

-- =============================================
-- ANALYTICS FUNCTIONS
-- =============================================

-- Function to get farm analytics
create or replace function public.get_farm_analytics(
  p_farm_id uuid,
  p_days integer default 30
)
returns jsonb as $$
declare
  start_date timestamp with time zone;
  analytics_data jsonb;
  total_tasks integer;
  completed_tasks integer;
  total_resources integer;
  active_resources integer;
  task_types jsonb;
  resource_types jsonb;
begin
  -- Check access
  if not exists (
    select 1 from public.farms f
    where f.id = p_farm_id
    and (f.owner_id = auth.uid() or exists (
      select 1 from public.collaborators c
      where c.farm_id = p_farm_id and c.user_id = auth.uid()
    ))
  ) then
    return jsonb_build_object('error', 'Access denied');
  end if;
  
  start_date := now() - interval '1 day' * p_days;
  
  -- Get task analytics
  select 
    count(*),
    count(*) filter (where status = 'completed')
  into total_tasks, completed_tasks
  from public.tasks
  where farm_id = p_farm_id
  and created_at >= start_date;
  
  -- Get resource analytics
  select 
    count(*),
    count(*) filter (where status = 'active')
  into total_resources, active_resources
  from public.resources
  where farm_id = p_farm_id;
  
  -- Get task types breakdown
  select jsonb_object_agg(type, count)
  into task_types
  from (
    select type, count(*)
    from public.tasks
    where farm_id = p_farm_id
    and created_at >= start_date
    group by type
  ) t;
  
  -- Get resource types breakdown
  select jsonb_object_agg(type, count)
  into resource_types
  from (
    select type, count(*)
    from public.resources
    where farm_id = p_farm_id
    group by type
  ) r;
  
  analytics_data := jsonb_build_object(
    'period_days', p_days,
    'tasks', jsonb_build_object(
      'total', coalesce(total_tasks, 0),
      'completed', coalesce(completed_tasks, 0),
      'completion_rate', case
        when total_tasks > 0 then round((completed_tasks::numeric / total_tasks) * 100, 2)
        else 0
      end,
      'by_type', coalesce(task_types, '{}')
    ),
    'resources', jsonb_build_object(
      'total', coalesce(total_resources, 0),
      'active', coalesce(active_resources, 0),
      'by_type', coalesce(resource_types, '{}')
    )
  );
  
  return analytics_data;
end;
$$ language plpgsql security definer;

-- =============================================
-- AWARDS SYSTEM
-- =============================================

-- Function to check and award achievements
create or replace function public.check_achievements(p_user_id uuid, p_farm_id uuid)
returns void as $$
declare
  completed_tasks_count integer;
  consecutive_days integer;
begin
  -- Get user's completed tasks count
  select count(*) into completed_tasks_count
  from public.tasks
  where farm_id = p_farm_id
  and assigned_to = p_user_id
  and status = 'completed';
  
  -- First task completion award
  if completed_tasks_count = 1 then
    insert into public.awards (farm_id, user_id, type, title, description, icon, points)
    values (
      p_farm_id,
      p_user_id,
      'first_task',
      'Getting Started',
      'Completed your first task',
      '🎯',
      10
    )
    on conflict do nothing;
  end if;
  
  -- Productive worker awards
  if completed_tasks_count = 10 then
    insert into public.awards (farm_id, user_id, type, title, description, icon, points)
    values (
      p_farm_id,
      p_user_id,
      'productive_worker',
      'Productive Worker',
      'Completed 10 tasks',
      '⚡',
      50
    )
    on conflict do nothing;
  end if;
  
  if completed_tasks_count = 50 then
    insert into public.awards (farm_id, user_id, type, title, description, icon, points)
    values (
      p_farm_id,
      p_user_id,
      'task_master',
      'Task Master',
      'Completed 50 tasks',
      '🏆',
      200
    )
    on conflict do nothing;
  end if;
  
end;
$$ language plpgsql security definer;

-- Trigger to check achievements after task completion
create or replace function public.check_achievements_trigger()
returns trigger as $$
begin
  if old.status != 'completed' and new.status = 'completed' and new.assigned_to is not null then
    perform public.check_achievements(new.assigned_to, new.farm_id);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger check_achievements_on_task_completion
  after update on public.tasks
  for each row execute procedure public.check_achievements_trigger();