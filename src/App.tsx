import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { Footer } from './components/Layout/Footer';
import { Dashboard } from './components/Dashboard/Dashboard';
import { AddTask } from './components/Tasks/AddTask';
import { ResourceManager } from './components/Resources/ResourceManager';
import { Insights } from './components/Insights/Insights';
import { History } from './components/History/History';
import { loadData, saveData } from './utils/storage';
import { User, Resource, Task, Award } from './types';
import { checkAwards } from './utils/awards';
export function App() {
  const [user, setUser] = useState<User>(() => {
    const savedUser = loadData('user');
    return savedUser || {
      id: '1',
      name: 'Ranch Owner',
      location: 'Texas Ranch'
    };
  });
  const [resources, setResources] = useState<Resource[]>(() => {
    const savedResources = loadData('resources');
    return savedResources || [{
      id: '1',
      type: 'animal',
      name: 'Cattle',
      quantity: 120,
      status: 'active'
    }, {
      id: '2',
      type: 'field',
      name: 'North Pasture',
      quantity: 1,
      status: 'active'
    }, {
      id: '3',
      type: 'equipment',
      name: 'Main Tractor',
      quantity: 1,
      status: 'active'
    }, {
      id: '4',
      type: 'feed',
      name: 'Hay Bales',
      quantity: 45,
      status: 'active'
    }];
  });
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = loadData('tasks');
    return savedTasks || [];
  });
  const [awards, setAwards] = useState<Award[]>(() => {
    const savedAwards = loadData('awards');
    return savedAwards || [];
  });
  // Save data whenever state changes
  useEffect(() => {
    saveData('user', user);
    saveData('resources', resources);
    saveData('tasks', tasks);
    saveData('awards', awards);
  }, [user, resources, tasks, awards]);
  // Check for new awards whenever tasks change
  useEffect(() => {
    const newAwards = checkAwards(tasks, awards);
    if (newAwards.length > 0) {
      setAwards([...awards, ...newAwards]);
    }
  }, [tasks]);
  const addTask = (task: Omit<Task, 'id' | 'ts'>) => {
    const newTask = {
      ...task,
      id: Date.now().toString(),
      ts: Date.now()
    };
    // Update resources if needed (e.g., reduce feed quantity when logging feeding)
    if (task.type === 'feeding' && task.resource_id && task.qty) {
      setResources(resources.map(resource => resource.id === task.resource_id && resource.type === 'feed' ? {
        ...resource,
        quantity: (resource.quantity || 0) - task.qty!
      } : resource));
    }
    setTasks([...tasks, newTask]);
  };
  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource = {
      ...resource,
      id: Date.now().toString()
    };
    setResources([...resources, newResource]);
  };
  return <div className="min-h-screen bg-amber-50 flex flex-col">
      <Router>
        <Navbar />
        <main className="flex-grow p-4 container mx-auto max-w-md">
          <Routes>
            <Route path="/" element={<Dashboard tasks={tasks} resources={resources} />} />
            <Route path="/task/add" element={<AddTask onAddTask={addTask} resources={resources} />} />
            <Route path="/resources" element={<ResourceManager resources={resources} onAddResource={addResource} />} />
            <Route path="/insights" element={<Insights tasks={tasks} resources={resources} awards={awards} />} />
            <Route path="/history" element={<History tasks={tasks} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </div>;
}