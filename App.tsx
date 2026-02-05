
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Dashboard, Tasks, Utilities, Reports, Settings, ReminderLibrary } from './components/Views.tsx';
import { Task, UtilityBill, AppState, Reminder } from './types.ts';
import { INITIAL_TASKS, INITIAL_BILLS, INITIAL_REMINDERS } from './constants.tsx';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const defaultState: AppState = {
      tasks: INITIAL_TASKS,
      bills: INITIAL_BILLS,
      reminders: INITIAL_REMINDERS,
      isDarkMode: false,
      activeTaskId: null,
    };
    
    try {
      const saved = localStorage.getItem('chronos_state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultState,
          ...parsed,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultState.tasks,
          bills: Array.isArray(parsed.bills) ? parsed.bills : defaultState.bills,
          reminders: Array.isArray(parsed.reminders) ? parsed.reminders : defaultState.reminders,
        };
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
    return defaultState;
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'utilities' | 'reports' | 'settings' | 'library'>('dashboard');

  useEffect(() => {
    localStorage.setItem('chronos_state', JSON.stringify(state));
  }, [state]);

  // Handle dark mode via document element class
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  // Timer logic for multiple active tasks
  useEffect(() => {
    const hasActiveTasks = state.tasks.some(t => t.status === 'In Progress');
    let interval: number | undefined;

    if (hasActiveTasks) {
      interval = window.setInterval(() => {
        setState(prev => {
          const updatedTasks = prev.tasks.map(t => {
            if (t.status === 'In Progress') {
              return { ...t, actualTime: (t.actualTime || 0) + 1 / 60 };
            }
            return t;
          });
          const hasChanges = updatedTasks.some((t, i) => t.actualTime !== prev.tasks[i].actualTime);
          if (!hasChanges) return prev;
          return { ...prev, tasks: updatedTasks };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [state.tasks.some(t => t.status === 'In Progress')]);

  const toggleDarkMode = useCallback(() => setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode })), []);

  const addTask = useCallback((task: Omit<Task, 'id' | 'actualTime' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: Math.random().toString(36).substr(2, 9),
      actualTime: 0,
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ 
      ...prev, 
      tasks: [newTask, ...(Array.isArray(prev.tasks) ? prev.tasks : [])] 
    }));
  }, []);

  const instantiateReminder = useCallback((reminder: Reminder) => {
    const newTask: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: reminder.title,
      category: reminder.category,
      priority: reminder.priority,
      estimatedTime: reminder.estimatedTime,
      actualTime: 0,
      type: reminder.type,
      status: 'Pending',
      dueDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };
    setState(prev => ({ 
      ...prev, 
      tasks: [newTask, ...prev.tasks] 
    }));
  }, []);

  const addReminder = useCallback((reminder: Omit<Reminder, 'id' | 'displayId'>) => {
    const prefix = reminder.type === 'Daily' ? 'D' : reminder.type === 'Weekly' ? 'W' : 'M';
    const count = state.reminders.filter(r => r.type === reminder.type).length + 1;
    const newReminder: Reminder = {
      ...reminder,
      id: Math.random().toString(36).substr(2, 9),
      displayId: `${prefix}-${count.toString().padStart(2, '0')}`,
    };
    setState(prev => ({
      ...prev,
      reminders: [...prev.reminders, newReminder]
    }));
  }, [state.reminders]);

  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.map(r => r.id === id ? { ...r, ...updates } : r)
    }));
  }, []);

  const deleteReminder = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      reminders: prev.reminders.filter(r => r.id !== id)
    }));
  }, []);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    }));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== taskId),
      activeTaskId: prev.activeTaskId === taskId ? null : prev.activeTaskId
    }));
  }, []);

  const startTask = useCallback((taskId: string) => {
    setState(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          return { ...t, status: 'In Progress' as const, startTime: Date.now() };
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
  }, []);

  const pauseTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'Pending', lastPausedAt: Date.now() });
  }, [updateTask]);

  const completeTask = useCallback((taskId: string) => {
    updateTask(taskId, { status: 'Completed', completedAt: new Date().toISOString() });
  }, [updateTask]);

  const addBill = useCallback((bill: Omit<UtilityBill, 'id'>) => {
    const newBill: UtilityBill = {
      ...bill,
      id: Math.random().toString(36).substr(2, 9),
    };
    setState(prev => ({
      ...prev,
      bills: [newBill, ...(Array.isArray(prev.bills) ? prev.bills : [])]
    }));
  }, []);

  const updateBill = useCallback((billId: string, updates: Partial<UtilityBill>) => {
    setState(prev => ({
      ...prev,
      bills: prev.bills.map(b => b.id === billId ? { ...b, ...updates } : b)
    }));
  }, []);

  return (
    <Layout 
      currentView={currentView} 
      setView={setCurrentView} 
      isDarkMode={state.isDarkMode} 
      toggleDarkMode={toggleDarkMode}
    >
      {currentView === 'dashboard' && <Dashboard state={state} onStart={startTask} onPause={pauseTask} onComplete={completeTask} />}
      {currentView === 'tasks' && <Tasks tasks={state.tasks} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTask} onStart={startTask} onPause={pauseTask} onComplete={completeTask} activeTaskId={state.activeTaskId} />}
      {currentView === 'utilities' && <Utilities bills={state.bills} onAdd={addBill} onUpdate={updateBill} />}
      {currentView === 'reports' && <Reports state={state} />}
      {currentView === 'library' && (
        <ReminderLibrary 
          reminders={state.reminders} 
          onInstantiate={instantiateReminder} 
          onAdd={addReminder}
          onUpdate={updateReminder}
          onDelete={deleteReminder}
          setView={setCurrentView} 
        />
      )}
      {currentView === 'settings' && <Settings state={state} setState={setState} />}
    </Layout>
  );
};

export default App;
