import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AuthPage } from './components/Auth/AuthPage';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AddTask } from './components/Tasks/AddTask';
import { ResourceManager } from './components/Resources/ResourceManager';
import { Insights } from './components/Insights/Insights';
import { History } from './components/History/History';
import { ProfileSettings } from './components/Auth/ProfileSettings';
import { Schedule } from './components/Schedule/Schedule';
import { Collaborators } from './components/Collaborators/Collaborators';
import { dataService } from './lib/dataService';
import { Database } from './lib/supabase';
import { checkAwards } from './utils/awards';
import { Loader2Icon } from 'lucide-react';

type Resource = Database['public']['Tables']['resources']['Row'];
type Task = Database['public']['Tables']['tasks']['Row'];
type Award = Database['public']['Tables']['awards']['Row'];
function AppContent() {
  const { user, loading } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [awards, setAwards] = useState<Award[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user data when user is authenticated
  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      setResources([]);
      setTasks([]);
      setAwards([]);
      setDataLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    setDataLoading(true);
    setError(null);
    try {
      // Load resources, tasks, and awards in parallel
      const [resourcesResult, tasksResult, awardsResult] = await Promise.all([
        dataService.resources.getAll(user.id),
        dataService.tasks.getAll(user.id),
        dataService.awards.getAll(user.id)
      ]);

      if (resourcesResult.error) {
        console.error('Error loading resources:', resourcesResult.error);
        setError('Failed to load resources');
      } else if (resourcesResult.data) {
        setResources(resourcesResult.data);
      }

      if (tasksResult.error) {
        console.error('Error loading tasks:', tasksResult.error);
        setError('Failed to load tasks');
      } else if (tasksResult.data) {
        setTasks(tasksResult.data);
      }

      if (awardsResult.error) {
        console.error('Error loading awards:', awardsResult.error);
        setError('Failed to load awards');
      } else if (awardsResult.data) {
        setAwards(awardsResult.data);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setError('Failed to load farm data');
    } finally {
      setDataLoading(false);
    }
  };

  // Check for new awards whenever tasks change
  useEffect(() => {
    if (user && tasks.length > 0) {
      const newAwards = checkAwards(tasks, awards);
      if (newAwards.length > 0) {
        // Save new awards to database
        newAwards.forEach(async (award) => {
          try {
            const result = await dataService.awards.create({
              user_id: user.id,
              label: award.label,
              reason: award.reason,
              earned_ts: award.earned_ts
            });
            if (result.error) {
              console.error('Error creating award:', result.error);
            }
          } catch (error) {
            console.error('Error creating award:', error);
          }
        });
        setAwards([...awards, ...newAwards]);
      }
    }
  }, [tasks, user, awards]);

  const addTask = async (taskData: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      // Convert frontend Task type to database TaskInsert type
      const newTask = {
        user_id: user.id,
        type: taskData.type,
        resource_id: taskData.resource_id || null,
        qty: taskData.qty || null,
        notes: taskData.notes || null,
        ts: Date.now(),
        completed: taskData.completed || false,
        image: taskData.image || null,
        priority: taskData.priority || null
      };

      const result = await dataService.tasks.create(newTask);
      if (result.error) {
        console.error('Error creating task:', result.error);
        throw new Error(result.error);
      }
      
      if (result.data) {
        setTasks([result.data, ...tasks]);
        
        // Update resources if needed (e.g., reduce feed quantity when logging feeding)
        if (taskData.type === 'feeding' && taskData.resource_id && taskData.qty) {
          const resource = resources.find(r => r.id === taskData.resource_id);
          if (resource && resource.quantity) {
            const updatedResource = {
              ...resource,
              quantity: resource.quantity - taskData.qty!
            };
            const updateResult = await dataService.resources.update(resource.id, updatedResource);
            if (updateResult.data) {
              setResources(resources.map(r => r.id === resource.id ? updateResult.data! : r));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const addResource = async (resourceData: Omit<Resource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      // Convert frontend Resource type to database ResourceInsert type
      const newResource = {
        user_id: user.id,
        type: resourceData.type,
        name: resourceData.name,
        quantity: resourceData.quantity || null,
        status: resourceData.status || null,
        health: resourceData.health || null,
        last_checked: resourceData.lastChecked ? new Date(resourceData.lastChecked).toISOString() : null,
        notes: resourceData.notes || null,
        image: resourceData.image || null
      };

      const result = await dataService.resources.create(newResource);
      if (result.error) {
        console.error('Error creating resource:', result.error);
        throw new Error(result.error);
      }
      
      if (result.data) {
        setResources([result.data, ...resources]);
      }
    } catch (error) {
      console.error('Error adding resource:', error);
      throw error;
    }
  };

  const updateResource = async (resourceId: string, updates: Partial<Resource>) => {
    if (!user) return;

    try {
      // Convert frontend Resource updates to database format
      const updateData: any = {};
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.health !== undefined) updateData.health = updates.health;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      if (updates.image !== undefined) updateData.image = updates.image;
      if (updates.lastChecked !== undefined) {
        updateData.last_checked = new Date(updates.lastChecked).toISOString();
      }

      const result = await dataService.resources.update(resourceId, updateData);
      if (result.error) {
        console.error('Error updating resource:', result.error);
        throw new Error(result.error);
      }
      
      if (result.data) {
        setResources(resources.map(r => r.id === resourceId ? result.data! : r));
      }
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  };

  const deleteResource = async (resourceId: string) => {
    if (!user) return;

    try {
      const result = await dataService.resources.delete(resourceId);
      if (result.error) {
        console.error('Error deleting resource:', result.error);
        throw new Error(result.error);
      }
      
      setResources(resources.filter(r => r.id !== resourceId));
    } catch (error) {
      console.error('Error deleting resource:', error);
      throw error;
    }
  };

  const completeTask = async (taskId: string) => {
    if (!user) return;

    try {
      // Find the current task to toggle its completion status
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) return;

      const result = await dataService.tasks.update(taskId, { completed: !currentTask.completed });
      if (result.error) {
        console.error('Error updating task:', result.error);
        throw new Error(result.error);
      }
      
      if (result.data) {
        setTasks(tasks.map(task => task.id === taskId ? result.data! : task));
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🌾</div>
          <Loader2Icon className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" />
          <p className="text-primary-700 font-medium">Loading RangeTrack...</p>
        </div>
      </div>
    );
  }

  // Show authentication page if user is not authenticated
  if (!user) {
    return <AuthPage />;
  }

  // Show loading screen while loading user data
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚜</div>
          <Loader2Icon className="animate-spin h-10 w-10 text-primary-600 mx-auto mb-4" />
          <p className="text-primary-700 font-medium">Loading your farm data...</p>
        </div>
      </div>
    );
  }

  // Show error screen if there's an error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-6">⚠️</div>
          <div className="card shadow-lg p-6">
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mb-6">
              <p className="font-semibold mb-2">Error Loading Farm Data</p>
              <p className="text-sm">{error}</p>
            </div>
            <button 
              onClick={loadUserData}
              className="btn-primary w-full py-3 font-semibold"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 flex flex-col">
        <Navbar />
        <main className="flex-grow p-4 container mx-auto max-w-md md:max-w-2xl lg:max-w-5xl">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} resources={resources} onCompleteTask={completeTask} />} />
            <Route path="/task/add" element={<AddTask onAddTask={addTask} resources={resources} />} />
            <Route path="/resources" element={<ResourceManager resources={resources} onAddResource={addResource} onUpdateResource={updateResource} onDeleteResource={deleteResource} />} />
            <Route path="/schedule" element={<Schedule tasks={tasks} onAddTask={addTask} />} />
            <Route path="/collaborators" element={<Collaborators />} />
            <Route path="/insights" element={<Insights tasks={tasks} resources={resources} awards={awards} />} />
            <Route path="/history" element={<History tasks={tasks} />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}