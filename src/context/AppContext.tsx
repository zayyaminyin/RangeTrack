import React, { useState, createContext, useContext } from 'react';
import { User, Resource, Task, Award, Weather } from '../types';
import { mockUser, mockResources, mockTasks, mockAwards, mockWeather, getTasksForToday, getUpcomingTasks, calculateFeedDaysRemaining } from '../data/mockData';
interface AppContextType {
  user: User;
  resources: Resource[];
  tasks: Task[];
  awards: Award[];
  weather: Weather;
  todayTasks: Task[];
  upcomingTasks: Task[];
  feedDaysRemaining: number;
  addTask: (task: Omit<Task, 'id' | 'ts'>) => void;
  completeTask: (id: string) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
}
const AppContext = createContext<AppContextType | undefined>(undefined);
export const AppProvider: React.FC<{
  children: ReactNode;
}> = ({
  children
}) => {
  const [user] = useState<User>(mockUser);
  const [resources, setResources] = useState<Resource[]>(mockResources);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [awards] = useState<Award[]>(mockAwards);
  const [weather] = useState<Weather>(mockWeather);
  const todayTasks = getTasksForToday();
  const upcomingTasks = getUpcomingTasks();
  const feedDaysRemaining = calculateFeedDaysRemaining();
  const addTask = (task: Omit<Task, 'id' | 'ts'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      ts: Date.now()
    };
    setTasks([...tasks, newTask]);
  };
  const completeTask = (id: string) => {
    setTasks(tasks.map(task => task.id === id ? {
      ...task,
      completed: true
    } : task));
  };
  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = {
      ...resource,
      id: Date.now().toString()
    };
    setResources([...resources, newResource]);
  };
  const updateResource = (id: string, updates: Partial<Resource>) => {
    setResources(resources.map(resource => resource.id === id ? {
      ...resource,
      ...updates
    } : resource));
  };
  return <AppContext.Provider value={{
    user,
    resources,
    tasks,
    awards,
    weather,
    todayTasks,
    upcomingTasks,
    feedDaysRemaining,
    addTask,
    completeTask,
    addResource,
    updateResource
  }}>
      {children}
    </AppContext.Provider>;
};
export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};