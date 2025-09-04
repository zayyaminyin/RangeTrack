import React, { createContext, useContext, useState, ReactNode } from 'react'
import { demoUser, demoResources, demoTasks, demoAwards, DemoTask, DemoResource, DemoAward } from '../lib/demoData'
import { AuthUser } from '../lib/auth'

interface DemoContextType {
  isDemoMode: boolean
  demoUser: AuthUser
  demoResources: DemoResource[]
  demoTasks: DemoTask[]
  demoAwards: DemoAward[]
  enterDemoMode: () => void
  exitDemoMode: () => void
  addDemoTask: (task: Omit<DemoTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  updateDemoTask: (taskId: string, updates: Partial<DemoTask>) => void
  deleteDemoTask: (taskId: string) => void
  addDemoResource: (resource: Omit<DemoResource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void
  updateDemoResource: (resourceId: string, updates: Partial<DemoResource>) => void
  deleteDemoResource: (resourceId: string) => void
}

const DemoContext = createContext<DemoContextType | undefined>(undefined)

export function useDemo() {
  const context = useContext(DemoContext)
  if (context === undefined) {
    throw new Error('useDemo must be used within a DemoProvider')
  }
  return context
}

interface DemoProviderProps {
  children: ReactNode
}

export function DemoProvider({ children }: DemoProviderProps) {
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [currentDemoTasks, setCurrentDemoTasks] = useState<DemoTask[]>(demoTasks)
  const [currentDemoResources, setCurrentDemoResources] = useState<DemoResource[]>(demoResources)

  const enterDemoMode = () => {
    setIsDemoMode(true)
    // Reset demo data to initial state when entering demo mode
    setCurrentDemoTasks(demoTasks)
    setCurrentDemoResources(demoResources)
  }

  const exitDemoMode = () => {
    setIsDemoMode(false)
  }

  const addDemoTask = (taskData: Omit<DemoTask, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newTask: DemoTask = {
      ...taskData,
      id: `demo-task-${Date.now()}`,
      user_id: demoUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setCurrentDemoTasks([newTask, ...currentDemoTasks])
  }

  const updateDemoTask = (taskId: string, updates: Partial<DemoTask>) => {
    setCurrentDemoTasks(tasks => 
      tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updated_at: new Date().toISOString() }
          : task
      )
    )
  }

  const deleteDemoTask = (taskId: string) => {
    setCurrentDemoTasks(tasks => tasks.filter(task => task.id !== taskId))
  }

  const addDemoResource = (resourceData: Omit<DemoResource, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const newResource: DemoResource = {
      ...resourceData,
      id: `demo-resource-${Date.now()}`,
      user_id: demoUser.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setCurrentDemoResources([newResource, ...currentDemoResources])
  }

  const updateDemoResource = (resourceId: string, updates: Partial<DemoResource>) => {
    setCurrentDemoResources(resources => 
      resources.map(resource => 
        resource.id === resourceId 
          ? { ...resource, ...updates, updated_at: new Date().toISOString() }
          : resource
      )
    )
  }

  const deleteDemoResource = (resourceId: string) => {
    setCurrentDemoResources(resources => resources.filter(resource => resource.id !== resourceId))
  }

  const value: DemoContextType = {
    isDemoMode,
    demoUser,
    demoResources: currentDemoResources,
    demoTasks: currentDemoTasks,
    demoAwards,
    enterDemoMode,
    exitDemoMode,
    addDemoTask,
    updateDemoTask,
    deleteDemoTask,
    addDemoResource,
    updateDemoResource,
    deleteDemoResource
  }

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>
}