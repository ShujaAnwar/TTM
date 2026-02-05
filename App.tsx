
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout, Dashboard, Tasks, Utilities, Reports, Settings, ReminderLibrary, AdminPanel, AdminLoginModal } from './components/Views.tsx';
import { Task, UtilityBill, AppState, Reminder, User, AppSettings, AuditLog } from './types.ts';
import { INITIAL_TASKS, INITIAL_BILLS, INITIAL_REMINDERS, INITIAL_SETTINGS, INITIAL_USERS } from './constants.tsx';
// Added missing format import from date-fns
import { format } from 'date-fns';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const defaultState: AppState = {
      tasks: INITIAL_TASKS,
      bills: INITIAL_BILLS,
      reminders: INITIAL_REMINDERS,
      users: INITIAL_USERS,
      auditLogs: [],
      settings: INITIAL_SETTINGS,
      isDarkMode: false,
      activeTaskId: null,
      currentUser: INITIAL_USERS[0],
    };
    
    try {
      const saved = localStorage.getItem('chronos_state_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.error("Failed to load state from localStorage", e);
    }
    return defaultState;
  });

  const [currentView, setCurrentView] = useState<any>(state.settings.layout.landingPage || 'dashboard');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('chronos_state_v4', JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (state.isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [state.isDarkMode]);

  const logAction = useCallback((action: string, module: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      userId: state.currentUser.id,
      userName: state.currentUser.name,
      action,
      module,
    };
    setState(prev => ({ ...prev, auditLogs: [newLog, ...prev.auditLogs].slice(0, 100) }));
  }, [state.currentUser]);

  // Enhanced Work Analysis Timer
  useEffect(() => {
    const activeTasks = state.tasks.filter(t => t.status === 'In Progress');
    if (activeTasks.length === 0) return;

    const interval = window.setInterval(() => {
      setState(prev => ({
        ...prev,
        tasks: prev.tasks.map(t => t.status === 'In Progress' ? { ...t, actualTime: (t.actualTime || 0) + (1/60) } : t)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [state.tasks.some(t => t.status === 'In Progress')]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'actualTime' | 'createdAt'>) => {
    const newTask: Task = { ...task, id: Math.random().toString(36).substr(2, 9), actualTime: 0, createdAt: new Date().toISOString() };
    setState(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    logAction(`Created Task: ${newTask.title}`, 'Task Manager');
  }, [logAction]);

  const updateTask = useCallback((taskId: string, updates: Partial<Task>) => {
    setState(prev => {
      const updatedTasks = prev.tasks.map(t => {
        if (t.id === taskId) {
          const updated = { ...t, ...updates };
          // Logic: Stop timer if completed
          if (updates.status === 'Completed') {
            updated.completedAt = new Date().toISOString();
          }
          return updated;
        }
        return t;
      });
      return { ...prev, tasks: updatedTasks };
    });
    if (updates.status) logAction(`Status update: ${updates.status} for ${taskId}`, 'Task Manager');
  }, [logAction]);

  const deleteTask = useCallback((taskId: string) => {
    setState(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) }));
    logAction('Deleted Task Record', 'Task Manager');
  }, [logAction]);

  const cloneTask = useCallback((taskId: string) => {
    const source = state.tasks.find(t => t.id === taskId);
    if (!source) return;
    addTask({ ...source, title: `${source.title} (Clone)`, status: 'Pending' });
  }, [state.tasks, addTask]);

  const addBill = useCallback((bill: Omit<UtilityBill, 'id'>) => {
    const newBill: UtilityBill = { ...bill, id: Math.random().toString(36).substr(2, 9) };
    setState(prev => ({ ...prev, bills: [newBill, ...prev.bills] }));
    logAction(`Logged Bill: ${newBill.type}`, 'Utility Bills');
  }, [logAction]);

  const updateBill = useCallback((id: string, u: Partial<UtilityBill>) => {
    setState(prev => ({ ...prev, bills: prev.bills.map(b => b.id === id ? { ...b, ...u } : b) }));
  }, []);

  const deleteBill = useCallback((id: string) => {
    setState(prev => ({ ...prev, bills: prev.bills.filter(b => b.id !== id) }));
  }, []);

  // Added missing cloneBill implementation
  const cloneBill = useCallback((id: string) => {
    const source = state.bills.find(b => b.id === id);
    if (!source) return;
    addBill({ ...source, referenceNumber: `${source.referenceNumber} (Copy)` });
  }, [state.bills, addBill]);

  return (
    <>
      <Layout 
        state={state}
        currentView={currentView} 
        setView={setCurrentView} 
        toggleDarkMode={() => setState(p => ({...p, isDarkMode: !p.isDarkMode}))}
        isAdminAuthenticated={isAdminAuthenticated}
        openAdminLogin={() => setIsAdminLoginOpen(true)}
      >
        {currentView === 'dashboard' && <Dashboard state={state} onStart={id => updateTask(id, { status: 'In Progress' })} onPause={id => updateTask(id, { status: 'Pending' })} onComplete={id => updateTask(id, { status: 'Completed' })} setView={setCurrentView} />}
        {currentView === 'tasks' && <Tasks tasks={state.tasks} onAdd={addTask} onUpdate={updateTask} onDelete={deleteTask} onClone={cloneTask} />}
        {currentView === 'utilities' && <Utilities bills={state.bills} onAdd={addBill} onClone={cloneBill} onDelete={deleteBill} onUpdate={updateBill} />}
        {currentView === 'reports' && <Reports state={state} />}
        {currentView === 'library' && <ReminderLibrary reminders={state.reminders} onInstantiate={r => addTask({ ...r, status: 'Pending', dueDate: format(new Date(), 'yyyy-MM-dd') })} onAdd={r => setState(p => ({...p, reminders: [...p.reminders, {...r, id: Math.random().toString(), displayId: 'NEW'}]}))} onUpdate={(id, u) => setState(p => ({...p, reminders: p.reminders.map(r => r.id === id ? {...r, ...u} : r)}))} onDelete={id => setState(p => ({...p, reminders: p.reminders.filter(r => r.id !== id)}))} setView={setCurrentView} />}
        {currentView === 'admin' && <AdminPanel state={state} updateSettings={s => setState(p => ({...p, settings: s}))} addUser={u => setState(p => ({...p, users: [...p.users, {...u, id: Math.random().toString()}]}))} updateUser={(id, u) => setState(p => ({...p, users: p.users.map(us => us.id === id ? {...us, ...u} : us)}))} deleteUser={id => setState(p => ({...p, users: p.users.filter(u => u.id !== id)}))} />}
        {currentView === 'settings' && <Settings state={state} setState={setState} />}
      </Layout>
      {isAdminLoginOpen && <AdminLoginModal onClose={() => setIsAdminLoginOpen(false)} onLogin={() => { setIsAdminAuthenticated(true); setIsAdminLoginOpen(false); setCurrentView('admin'); }} />}
    </>
  );
};

export default App;
