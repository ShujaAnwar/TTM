
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Dashboard, Tasks, Utilities, Reports, Settings } from './components/Views';
import { Task, UtilityBill, AppState } from './types';
import { INITIAL_TASKS, INITIAL_BILLS } from './constants';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const defaultState: AppState = {
      tasks: INITIAL_TASKS,
      bills: INITIAL_BILLS,
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
        };
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
    return defaultState;
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'utilities' | 'reports' | 'settings'>('dashboard');

  useEffect(() => {
    localStorage.setItem('chronos_state', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-slate-900', 'text-slate-100');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-slate-900', 'text-slate-100');
    }
  }, [state.isDarkMode]);

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
      {currentView === 'settings' && <Settings state={state} setState={setState} />}
    </Layout>
  );
};

export default App;
