import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus, 
  Play, 
  Pause, 
  Clock, 
  Search, 
  Download, 
  Trash2, 
  Loader2, 
  Copy, 
  Calendar, 
  Bookmark, 
  Edit2, 
  Menu, 
  X, 
  ShieldCheck, 
  Activity, 
  Lock, 
  Check,
  Fingerprint,
  ChevronDown,
  Target,
  Moon,
  Sun,
  UploadCloud
} from 'lucide-react';
import { Task, UtilityBill, AppState, Priority, TaskStatus, RecurrenceType, Reminder, User, Role, AppSettings } from '../types';
import { CATEGORIES, PRIORITIES, RECURRENCE_TYPES, CAMPUSES, ROLES } from '../constants';
import { format, isSameDay, parseISO, isWithinInterval, startOfDay, endOfDay, subDays } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Helper Functions ---
const formatTime = (minutes: number = 0) => {
  const safeMinutes = Math.max(0, Math.floor(minutes || 0)); 
  const h = Math.floor(safeMinutes / 60); 
  const m = safeMinutes % 60; 
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const formatTimeDetailed = (minutes: number = 0) => {
  const safeMinutes = Math.max(0, minutes || 0);
  if (safeMinutes === 0) return "0s";
  const h = Math.floor(safeMinutes / 60);
  const m = Math.floor(safeMinutes % 60);
  const s = Math.floor((safeMinutes * 60) % 60);
  
  const parts = [];
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  if (s > 0) parts.push(`${s}s`);
  
  return parts.length > 0 ? parts.join(' ') : "0s";
};

const getPriorityColor = (p: Priority) => {
  switch (p) { 
    case 'High': return 'bg-rose-500'; 
    case 'Medium': return 'bg-amber-500'; 
    case 'Low': return 'bg-emerald-500'; 
    default: return 'bg-slate-400'; 
  }
};

// --- Shared UI Components ---

export const Layout: React.FC<{
  state: AppState;
  children: React.ReactNode;
  currentView: string;
  setView: (v: any) => void;
  toggleDarkMode: () => void;
  isAdminAuthenticated: boolean;
  openAdminLogin: () => void;
}> = ({ state, children, currentView, setView, toggleDarkMode, isAdminAuthenticated, openAdminLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings, isDarkMode, currentUser } = state;
  const { branding, layout, modules, rolePermissions } = settings;
  const permissions = rolePermissions[currentUser.role];
  
  const longPressTimer = useRef<number | null>(null);

  const startLongPress = () => {
    longPressTimer.current = window.setTimeout(() => {
      if (navigator.vibrate) navigator.vibrate(50);
      openAdminLogin();
    }, 2500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: <LayoutDashboard size={20} />, enabled: true },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} />, enabled: modules.taskManager && permissions.viewTasks },
    { id: 'library', label: 'Library', icon: <Bookmark size={20} />, enabled: modules.reminderLibrary && permissions.viewTasks },
    { id: 'utilities', label: 'Bills', icon: <Receipt size={20} />, enabled: modules.utilityBills && permissions.manageBills },
    { id: 'reports', label: 'Reports', icon: <BarChart3 size={20} />, enabled: modules.analytics && permissions.downloadReports },
  ];

  const adminItem = { id: 'admin', label: 'C-Panel', icon: <ShieldCheck size={20} />, enabled: isAdminAuthenticated };

  return (
    <div className={`flex h-screen overflow-hidden ${isDarkMode ? 'dark' : ''} bg-slate-50 dark:bg-slate-950 transition-colors duration-300`}>
      {/* Sidebar - Desktop */}
      <aside className={`bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden lg:flex shrink-0 transition-all ${layout.compactMode ? 'w-20' : 'w-64'}`}>
        <div 
          className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 cursor-pointer select-none group"
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
        >
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg group-active:scale-110 transition-transform">
            <Clock size={24} />
          </div>
          {!layout.compactMode && <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white truncate">{branding.orgName}</span>}
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.filter(i => i.enabled).map(item => (
            <NavItem key={item.id} icon={item.icon} label={item.label} active={currentView === item.id} onClick={() => setView(item.id)} compact={layout.compactMode} />
          ))}
          {adminItem.enabled && (
             <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <NavItem icon={adminItem.icon} label={adminItem.label} active={currentView === 'admin'} onClick={() => setView('admin')} compact={layout.compactMode} className="text-indigo-600" />
             </div>
          )}
        </nav>
        <div className="p-4 mt-auto space-y-2">
          <button onClick={() => setView('settings')} className={`w-full flex items-center ${layout.compactMode ? 'justify-center' : 'px-4'} py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}>
            <SettingsIcon size={20} />
            {!layout.compactMode && <span className="ml-3 text-sm font-medium">Settings</span>}
          </button>
          <button onClick={toggleDarkMode} className="w-full flex items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400">
            {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
            {!layout.compactMode && <span className="ml-3 text-sm font-medium">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar / Hamburger Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-slate-900 shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Clock size={18} /></div>
                <span className="font-bold dark:text-white">{branding.orgName}</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400"><X size={20} /></button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
               {navItems.filter(i => i.enabled).map(item => (
                <NavItem key={item.id} icon={item.icon} label={item.label} active={currentView === item.id} onClick={() => { setView(item.id); setIsMobileMenuOpen(false); }} />
              ))}
              {adminItem.enabled && <NavItem icon={adminItem.icon} label={adminItem.label} active={currentView === 'admin'} onClick={() => { setView('admin'); setIsMobileMenuOpen(false); }} className="text-indigo-600" />}
              <NavItem icon={<SettingsIcon size={20} />} label="Settings" active={currentView === 'settings'} onClick={() => { setView('settings'); setIsMobileMenuOpen(false); }} />
            </nav>
            <div className="p-6 border-t border-slate-100 dark:border-slate-800">
               <button onClick={toggleDarkMode} className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-sm">
                {isDarkMode ? <><Moon size={18} /> Dark Mode</> : <><Sun size={18} /> Light Mode</>}
              </button>
            </div>
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {branding.showSpiritualHeader && (
          <div className="w-full py-2 sm:py-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center px-4 shrink-0 transition-colors shadow-sm">
            <h2 className="font-arabic text-xl sm:text-2xl text-indigo-600 dark:text-indigo-400 font-bold leading-tight">بسم الله الرحمن الرحیم</h2>
            <p className="hidden sm:block font-arabic text-sm sm:text-base text-indigo-500/80 dark:text-indigo-300/60 mt-1 max-w-2xl">اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا</p>
          </div>
        )}

        <header className="h-14 md:h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden text-slate-600 dark:text-slate-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><Menu size={20} /></button>
            <h1 className="text-sm md:text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wider truncate max-w-[120px] sm:max-w-none">{currentView.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
              <Calendar size={14} className="text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500">{format(new Date(), 'MMM dd, p')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-slate-800 dark:text-white leading-none">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black">{currentUser.role}</p>
              </div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md">{currentUser.name.charAt(0)}</div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth bg-slate-50 dark:bg-slate-950 pb-20 lg:pb-6">
          <div className="max-w-[1920px] mx-auto p-4 md:p-6 xl:p-10">
            {children}
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-1 flex items-center justify-around z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
           {navItems.filter(i => i.enabled).slice(0, 4).map(item => (
             <MobileNavItem key={item.id} icon={item.icon} active={currentView === item.id} onClick={() => setView(item.id)} label={item.label} />
           ))}
           <MobileNavItem icon={<Menu size={20} />} active={isMobileMenuOpen} onClick={() => setIsMobileMenuOpen(true)} label="More" />
        </nav>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void; compact?: boolean; className?: string }> = ({ icon, label, active, onClick, compact, className }) => (
  <button onClick={onClick} className={`w-full flex items-center ${compact ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'} ${className || ''}`}>
    {icon}
    {!compact && <span className="text-sm font-bold">{label}</span>}
  </button>
);

const MobileNavItem: React.FC<{ icon: React.ReactNode; active: boolean; onClick: () => void; label: string }> = ({ icon, active, onClick, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 py-1.5 transition-all ${active ? 'text-indigo-600' : 'text-slate-400 dark:text-slate-500'}`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'scale-100'}`}>{icon}</div>
    <span className={`text-[10px] mt-0.5 font-bold transition-opacity ${active ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
  </button>
);

// --- Dashboard View ---

export const Dashboard: React.FC<{ 
  state: AppState; 
  onStart: (id: string) => void; 
  onPause: (id: string) => void; 
  onComplete: (id: string) => void;
  setView?: (v: any) => void;
}> = ({ state, onStart, onPause, onComplete, setView }) => {
  const { tasks, bills } = state;

  const todayTasks = useMemo(() => tasks.filter(t => isSameDay(new Date(t.dueDate), new Date())), [tasks]);
  const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress');
  const pendingBills = bills.filter(b => b.status === 'Pending').length;
  const totalActual = todayTasks.reduce((acc, t) => acc + (t.actualTime || 0), 0);
  const totalEstimated = todayTasks.reduce((acc, t) => acc + (t.estimatedTime || 0), 0);
  const productivityScore = totalEstimated > 0 ? Math.min(100, Math.round((completedToday / (todayTasks.length || 1)) * 100)) : 0;

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <DashboardStatCard label="Efficiency" value={`${productivityScore}%`} icon={<Target size={20} />} active={productivityScore > 80} />
        <DashboardStatCard label="Tasks Done" value={`${completedToday}/${todayTasks.length}`} icon={<CheckSquare size={20} />} />
        <DashboardStatCard label="Time Logged" value={formatTimeDetailed(totalActual)} icon={<Clock size={20} />} />
        <DashboardStatCard label="Bills Pending" value={pendingBills.toString()} icon={<Receipt size={20} />} active={pendingBills > 3} color="rose" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-10">
        <div className="xl:col-span-2 space-y-6 sm:space-y-10">
          <section className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white flex items-center gap-3 uppercase tracking-widest">
                <Play size={16} className="text-indigo-600" /> Currently Active
              </h2>
              <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 text-[10px] font-black rounded uppercase">{inProgress.length} Tasks</span>
            </div>
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {inProgress.length > 0 ? inProgress.map(task => (
                <InProgressRow key={task.id} task={task} onPause={() => onPause(task.id)} onComplete={() => onComplete(task.id)} />
              )) : (
                <div className="p-10 sm:p-20 text-center text-slate-400 text-sm italic font-medium">No tasks currently running. Start a task from the Task Manager.</div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white uppercase tracking-widest">Upcoming Priority</h2>
              <button onClick={() => setView?.('tasks')} className="text-[10px] font-black text-indigo-600 uppercase hover:underline">See All</button>
            </div>
            <div className="space-y-3">
              {tasks.filter(t => t.status !== 'Completed').slice(0, 5).map(task => (
                <DeadlineRow key={task.id} task={task} onStart={() => onStart(task.id)} />
              ))}
              {tasks.length === 0 && <div className="p-10 text-center text-slate-400 text-sm">Task queue is empty.</div>}
            </div>
          </section>
        </div>

        <div className="space-y-6 sm:space-y-10">
          <section className="bg-white dark:bg-slate-900 rounded-[24px] sm:rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8">
            <h2 className="text-xs sm:text-sm font-black text-slate-800 dark:text-white mb-8 uppercase tracking-widest text-center">Operation Breakdown</h2>
            <div className="h-48 sm:h-64 relative mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'Done', value: completedToday, color: '#10b981' }, { name: 'Pending', value: tasks.length - completedToday, color: '#6366f1' }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                    <Cell fill="#10b981" />
                    <Cell fill="#6366f1" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{productivityScore}%</span>
                <span className="text-[10px] font-black text-slate-400 uppercase">Target</span>
              </div>
            </div>
            <div className="flex justify-center gap-6">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500" /><span className="text-[10px] font-black uppercase text-slate-500">Done</span></div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-indigo-500" /><span className="text-[10px] font-black uppercase text-slate-500">Pending</span></div>
            </div>
          </section>

          <section className="bg-indigo-600 rounded-[24px] sm:rounded-[32px] p-8 text-white relative overflow-hidden group shadow-xl">
             <Receipt size={120} className="absolute -bottom-8 -right-8 text-indigo-400 opacity-20 group-hover:scale-110 transition-transform" />
             <div className="relative z-10">
               <h3 className="text-xl font-black mb-1">Financial Check</h3>
               <p className="text-xs text-indigo-100 font-medium mb-6">{pendingBills} pending utility payments detected.</p>
               <button onClick={() => setView?.('utilities')} className="w-full py-3.5 bg-white text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-50 transition-all">Settle Bills</button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const DashboardStatCard: React.FC<{ label: string; value: string; icon: React.ReactNode; active?: boolean; color?: 'indigo' | 'rose' }> = ({ label, value, icon, active, color = 'indigo' }) => (
  <div className={`bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-[20px] sm:rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col transition-all hover:translate-y-[-4px] group ${active ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : ''}`}>
    <div className={`p-3 w-fit rounded-xl mb-4 transition-colors ${color === 'rose' ? 'bg-rose-50 text-rose-600 group-hover:bg-rose-600 group-hover:text-white' : 'bg-slate-50 dark:bg-slate-800 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
      {icon}
    </div>
    <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mt-0.5">{value}</span>
  </div>
);

const InProgressRow: React.FC<{ task: Task; onPause: () => void; onComplete: () => void }> = ({ task, onPause, onComplete }) => (
  <div className="p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
    <div className="flex items-center gap-4 flex-1 w-full">
      <div className={`w-1.5 h-10 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)} ${task.priority === 'High' ? 'animate-blink' : ''}`} />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-slate-800 dark:text-white text-sm base truncate">{task.title}</h4>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] font-black text-slate-400 uppercase">{task.category}</span>
          <span className="text-indigo-600 text-[10px] font-black animate-pulse">{formatTimeDetailed(task.actualTime)}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-3 w-full md:w-auto">
      <button onClick={onPause} className="flex-1 md:flex-none px-6 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest">Pause</button>
      <button onClick={onComplete} className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md">Complete</button>
    </div>
  </div>
);

const DeadlineRow: React.FC<{ task: Task; onStart: () => void }> = ({ task, onStart }) => (
  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/60 flex items-center justify-between transition-all hover:shadow-md">
    <div className="flex items-center gap-4 flex-1 min-w-0">
      <div className={`w-1 h-8 rounded-full flex-shrink-0 ${getPriorityColor(task.priority)}`} />
      <div className="min-w-0">
        <h4 className="font-bold text-slate-700 dark:text-slate-200 text-xs sm:text-sm truncate">{task.title}</h4>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-black text-slate-400 uppercase">Due {format(parseISO(task.dueDate), 'MMM dd')}</span>
        </div>
      </div>
    </div>
    <button onClick={onStart} className="p-2.5 text-slate-400 hover:text-indigo-600 transition-colors bg-white dark:bg-slate-900 rounded-xl shadow-sm"><Play size={16} fill="currentColor" fillOpacity={0.1} /></button>
  </div>
);

// --- Task Manager Component ---

export const Tasks: React.FC<{
  tasks: Task[];
  onAdd: (task: Omit<Task, 'id' | 'actualTime' | 'createdAt'>) => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete: (taskId: string) => void;
  onClone: (taskId: string) => void;
}> = ({ tasks, onAdd, onUpdate, onDelete, onClone }) => {
  const [filter, setFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const filtered = useMemo(() => tasks.filter(t => t.title.toLowerCase().includes(filter.toLowerCase())), [tasks, filter]);

  const handleClone = (taskId: string) => {
    const source = tasks.find(t => t.id === taskId);
    if (source) {
      const cloneTemplate = {
        ...source,
        id: '', 
        title: `${source.title} (Clone)`,
        status: 'Pending' as TaskStatus,
        actualTime: 0,
      };
      setEditingTask(cloneTemplate as Task);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search tasks..." 
            className="w-full pl-12 pr-4 py-3 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            value={filter}
            onChange={e => setFilter(e.target.value)}
          />
        </div>
        <button onClick={() => { setEditingTask(null); setIsModalOpen(true); }} className="px-6 py-3 sm:py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Plus size={20} /> New Task</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-8">
        {filtered.map(task => (
          <TaskCard key={task.id} task={task} onUpdate={onUpdate} onDelete={onDelete} onClone={() => handleClone(task.id)} onEdit={() => { setEditingTask(task); setIsModalOpen(true); }} />
        ))}
      </div>

      {isModalOpen && <NewTaskModal task={editingTask} onClose={() => setIsModalOpen(false)} onSubmit={(data) => { if(editingTask?.id) onUpdate(editingTask.id, data); else onAdd(data); setIsModalOpen(false); }} />}
    </div>
  );
};

const TaskCard: React.FC<{ task: Task; onUpdate: (id: string, u: any) => void; onDelete: (id: string) => void; onClone: () => void; onEdit: () => void }> = ({ task, onUpdate, onDelete, onClone, onEdit }) => {
  const isRunning = task.status === 'In Progress';
  const isCompleted = task.status === 'Completed';

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-[28px] p-6 sm:p-8 border-2 shadow-sm transition-all relative flex flex-col h-full ${isRunning ? 'border-indigo-400 shadow-indigo-100 ring-2 ring-indigo-50 dark:ring-0' : 'border-indigo-50 dark:border-indigo-900/20'}`}>
      <div className="flex justify-between items-start mb-6">
        <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-lg tracking-widest">{task.type}</span>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" title="Edit Task"><Edit2 size={16} /></button>
          <button onClick={onClone} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors" title="Clone Task"><Copy size={16} /></button>
          <button onClick={() => confirm('Delete?') && onDelete(task.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors" title="Delete Task"><Trash2 size={16} /></button>
        </div>
      </div>
      <h3 className="text-lg sm:text-xl font-black text-slate-800 dark:text-white leading-tight mb-4 min-h-[3rem]">{task.title}</h3>
      <div className="flex items-center gap-3 mb-8">
        <div className={`w-2.5 h-2.5 rounded-full ${getPriorityColor(task.priority)} shadow-sm ${task.priority === 'High' ? 'animate-blink' : ''}`} />
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{task.priority} Priority • {task.category}</span>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl mb-8">
        <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">ESTIMATED</p><p className="text-sm font-black text-slate-700 dark:text-slate-200">{formatTime(task.estimatedTime)}</p></div>
        <div><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MEASURED</p><p className={`text-sm font-black ${isRunning ? 'text-indigo-600 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>{formatTimeDetailed(task.actualTime)}</p></div>
      </div>
      <div className="mt-auto space-y-3">
        {!isCompleted ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <button disabled={isRunning} onClick={() => onUpdate(task.id, { status: 'In Progress' })} className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isRunning ? 'bg-indigo-50 text-indigo-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-md active:scale-95'}`}><Play size={12} fill="currentColor" /> START</button>
              <button disabled={!isRunning} onClick={() => onUpdate(task.id, { status: 'Pending' })} className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${!isRunning ? 'bg-slate-50 text-slate-300 cursor-not-allowed' : 'bg-amber-100 text-amber-600 active:scale-95'}`}><Pause size={12} fill="currentColor" /> PAUSE</button>
            </div>
            <button onClick={() => onUpdate(task.id, { status: 'Completed' })} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 active:scale-95"><Check size={14} strokeWidth={3} /> COMPLETE WORK</button>
          </>
        ) : (
          <button onClick={() => onUpdate(task.id, { status: 'Pending' })} className="w-full py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 flex items-center justify-center gap-2 active:scale-95"><Activity size={14} /> RE-OPEN FOR CORRECTION</button>
        )}
      </div>
    </div>
  );
};

// --- Reports View ---

export const Reports: React.FC<{ state: AppState }> = ({ state }) => {
  const { tasks, bills, settings } = state;
  const [fromDate, setFromDate] = useState(format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [loading, setLoading] = useState(false);

  const filteredTasks = useMemo(() => { 
    const start = startOfDay(parseISO(fromDate)); 
    const end = endOfDay(parseISO(toDate)); 
    return tasks.filter(t => isWithinInterval(parseISO(t.dueDate), { start, end })); 
  }, [tasks, fromDate, toDate]);

  const filteredBillsCount = useMemo(() => {
    const start = startOfDay(parseISO(fromDate)); 
    const end = endOfDay(parseISO(toDate)); 
    return bills.filter(b => isWithinInterval(parseISO(b.dueDate), { start, end })).length;
  }, [bills, fromDate, toDate]);

  const stats = useMemo(() => { 
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.status === 'Completed').length;
    const pending = total - completed;
    const timeTrackedMin = filteredTasks.reduce((acc, t) => acc + (t.actualTime || 0), 0); 
    const estimatedMin = filteredTasks.reduce((acc, t) => acc + (t.estimatedTime || 0), 0); 
    
    const timeTrackedStr = formatTimeDetailed(timeTrackedMin);
    const efficiency = timeTrackedMin > 0 && estimatedMin > 0 ? `${Math.round((timeTrackedMin / estimatedMin) * 100)}%` : 'N/A';

    return { total, completed, pending, timeTrackedStr, efficiency }; 
  }, [filteredTasks]);

  const downloadPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF();
      const orgName = (settings.branding.orgName || 'TTM BY HASHMI').toUpperCase();
      
      doc.setTextColor(99, 102, 241); 
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text(orgName, 15, 20);

      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.text('Operational Performance Report', 15, 32);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated on: ${format(new Date(), 'MMMM do, yyyy h:mm a')}`, 15, 42);
      doc.text(`Reporting Period: ${format(parseISO(fromDate), 'MMM dd, yyyy')} to ${format(parseISO(toDate), 'MMM dd, yyyy')}`, 15, 48);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('Summary Statistics', 15, 62);

      const statsY = 75;
      const statsX = 15;
      const valX = statsX + 45;
      const lineSpacing = 8;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Total Tasks:', statsX, statsY);
      doc.text('Completed:', statsX, statsY + lineSpacing);
      doc.text('Pending:', statsX, statsY + (lineSpacing * 2));
      doc.text('Total Time Tracked:', statsX, statsY + (lineSpacing * 3));
      doc.text('Efficiency Index:', statsX, statsY + (lineSpacing * 4));
      doc.text('Bills in Range:', statsX, statsY + (lineSpacing * 5));

      doc.setFont('helvetica', 'bold');
      doc.text(stats.total.toString(), valX, statsY);
      doc.text(stats.completed.toString(), valX, statsY + lineSpacing);
      doc.text(stats.pending.toString(), valX, statsY + (lineSpacing * 2));
      doc.text(stats.timeTrackedStr, valX, statsY + (lineSpacing * 3));
      doc.text(stats.efficiency, valX, statsY + (lineSpacing * 4));
      doc.text(filteredBillsCount.toString(), valX, statsY + (lineSpacing * 5));

      doc.setFontSize(13);
      doc.text('Task Log', 15, 135);

      autoTable(doc, { 
        startY: 145, 
        head: [['Task', 'Category', 'Status', 'Est. Time', 'Act. Time', 'Due Date']], 
        body: filteredTasks.map(t => [t.title, t.category, t.status, formatTime(t.estimatedTime), formatTimeDetailed(t.actualTime), t.dueDate]),
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [248, 250, 255] },
        styles: { fontSize: 9, cellPadding: 4 }
      });

      doc.save(`TTM_Report_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`);
    } finally { setLoading(false); }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-[#6366f1] tracking-tight uppercase">TTM BY HASHMI</h2>
            <p className="text-xl font-bold text-slate-800 dark:text-white">Operational Performance Report</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-transparent text-xs font-bold px-3 py-2 outline-none dark:text-white" />
              <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-transparent text-xs font-bold px-3 py-2 outline-none dark:text-white" />
            </div>
            <button onClick={downloadPDF} disabled={loading} className="px-8 py-4 bg-[#6366f1] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} DOWNLOAD PDF
            </button>
          </div>
       </div>

       <div className="bg-white dark:bg-slate-900 p-8 sm:p-12 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12">
          <div className="space-y-4">
             <div className="flex flex-col gap-1">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Generated on: <span className="font-bold text-slate-800 dark:text-white">{format(new Date(), 'MMMM do, yyyy h:mm a')}</span></p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Reporting Period: <span className="font-bold text-slate-800 dark:text-white">{format(parseISO(fromDate), 'MMM dd, yyyy')} to {format(parseISO(toDate), 'MMM dd, yyyy')}</span></p>
             </div>

             <hr className="border-slate-100 dark:border-slate-800" />

             <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Summary Statistics</h3>
                <div className="grid grid-cols-1 gap-y-3 max-w-sm ml-4">
                   {[
                     { label: 'Total Tasks:', value: stats.total },
                     { label: 'Completed:', value: stats.completed },
                     { label: 'Pending:', value: stats.pending },
                     { label: 'Total Time Tracked:', value: stats.timeTrackedStr },
                     { label: 'Efficiency Index:', value: stats.efficiency },
                     { label: 'Bills in Range:', value: filteredBillsCount },
                   ].map(item => (
                     <div key={item.label} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                        <span className="font-black text-slate-800 dark:text-white text-right w-40">{item.value}</span>
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-6 pt-6">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Task Log</h3>
                <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-slate-800">
                   <table className="w-full text-left">
                      <thead>
                         <tr className="bg-[#6366f1] text-white">
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Task</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Est. Time</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Act. Time</th>
                            <th className="px-6 py-4 text-[11px] font-black uppercase tracking-wider">Due Date</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                         {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => (
                            <tr key={task.id} className={idx % 2 === 1 ? 'bg-[#f8faff] dark:bg-slate-800/20' : 'bg-white dark:bg-slate-900'}>
                               <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-white leading-tight">{task.title}</td>
                               <td className="px-6 py-4 text-xs font-medium text-slate-500">{task.category}</td>
                               <td className="px-6 py-4 text-xs font-bold">{task.status}</td>
                               <td className="px-6 py-4 text-xs font-mono font-medium text-slate-500">{formatTime(task.estimatedTime)}</td>
                               <td className="px-6 py-4 text-xs font-mono font-bold text-slate-800 dark:text-white">{formatTimeDetailed(task.actualTime)}</td>
                               <td className="px-6 py-4 text-xs font-mono font-medium text-slate-500">{task.dueDate}</td>
                            </tr>
                         )) : (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400 font-medium italic">No entries for this period.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Modals and Internal Views ---

export const NewTaskModal: React.FC<{ task?: Task | null; onClose: () => void; onSubmit: (data: any) => void }> = ({ task, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    category: task?.category || CATEGORIES[0],
    priority: task?.priority || PRIORITIES[1],
    time: task?.estimatedTime.toString() || '30',
    type: task?.type || RECURRENCE_TYPES[0],
    dueDate: task?.dueDate || format(new Date(), 'yyyy-MM-dd')
  });

  const isEdit = !!(task && task.id);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[500px] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-[#1e293b] dark:text-white uppercase tracking-wider">{isEdit ? 'EDIT OPERATIONAL TASK' : 'NEW OPERATIONAL TASK'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 space-y-7 bg-[#fcfcfd] dark:bg-slate-900/50">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">WORK TITLE</label>
            <input 
              type="text" 
              className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#6366f1] transition-all font-medium text-slate-700 dark:text-white"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CATEGORY</label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#6366f1] font-bold text-slate-700 dark:text-white appearance-none"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">PRIORITY</label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#6366f1] font-bold text-slate-700 dark:text-white appearance-none"
                  value={formData.priority}
                  onChange={e => setFormData({...formData, priority: e.target.value as any})}
                >
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">EST. TIME (MIN)</label>
              <input 
                type="number" 
                className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#6366f1] font-bold text-slate-700 dark:text-white"
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">TYPE</label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#6366f1] font-bold text-slate-700 dark:text-white appearance-none"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value as any})}
                >
                  {RECURRENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">DUE DATE</label>
            <div className="relative">
              <input 
                type="date" 
                className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-[#6366f1] font-bold text-slate-700 dark:text-white"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
              <Calendar size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button type="button" onClick={onClose} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">DISCARD</button>
          <button 
            type="button" 
            onClick={() => { if(!formData.title.trim()) return; onSubmit({ ...formData, estimatedTime: parseInt(formData.time) || 30 }); }} 
            className="px-10 py-4 bg-[#6366f1] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {isEdit ? 'SAVE CHANGES' : 'INITIALIZE TASK'}
          </button>
        </div>
      </div>
    </div>
  );
};

export const UtilityModal: React.FC<{ bill?: UtilityBill | null; onClose: () => void; onSubmit: (data: any) => void }> = ({ bill, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: bill?.type || '',
    location: bill?.location || CAMPUSES[0],
    referenceNumber: bill?.referenceNumber || '',
    contactNumber: bill?.contactNumber || '',
    month: bill?.month || format(new Date(), 'MMMM yyyy'),
    dueDate: bill?.dueDate || format(new Date(), 'yyyy-MM-dd'),
    amount: bill?.amount?.toString() || '0',
    status: bill?.status || 'Pending',
  });

  const isEdit = !!(bill && bill.id);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[550px] rounded-3xl shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
          <h2 className="text-xl font-bold text-[#1e293b] dark:text-white uppercase tracking-wider">{isEdit ? 'EDIT BILL RECORD' : 'NEW BILL RECORD'}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 transition-colors"><X size={24} /></button>
        </div>
        
        <div className="p-8 space-y-5 bg-[#fcfcfd] dark:bg-slate-900/50 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">UTILITY TYPE</label>
              <input type="text" className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#6366f1] font-medium" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} placeholder="e.g. K-Electric" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">LOCATION</label>
              <select className="w-full px-4 py-3.5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#6366f1] font-bold" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">REF NUMBER</label>
              <input type="text" className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#6366f1] font-medium" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">CONTACT #</label>
              <input type="text" className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#6366f1] font-medium" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">DUE DATE</label>
              <input type="date" className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#6366f1] font-bold" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">AMOUNT (RS.)</label>
              <input type="number" className="w-full px-5 py-3.5 bg-white border-2 border-slate-200 rounded-2xl outline-none focus:border-[#6366f1] font-bold" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
            </div>
          </div>
        </div>
        <div className="px-8 py-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button type="button" onClick={onClose} className="text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600">DISCARD</button>
          <button type="button" onClick={() => onSubmit({...formData, amount: parseFloat(formData.amount)||0})} className="px-10 py-4 bg-[#6366f1] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">SAVE RECORD</button>
        </div>
      </div>
    </div>
  );
};

export const Utilities: React.FC<{ bills: UtilityBill[]; onAdd: (bill: Omit<UtilityBill, 'id'>) => void; onClone: (id: string) => void; onDelete: (id: string) => void; onUpdate: (id: string, updates: Partial<UtilityBill>) => void; }> = ({ bills, onAdd, onClone, onDelete, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<UtilityBill | null>(null);

  const handleEdit = (bill: UtilityBill) => { setEditingBill(bill); setIsModalOpen(true); };
  const handleClone = (id: string) => { const source = bills.find(b => b.id === id); if (source) { setEditingBill({ ...source, id: '', type: `${source.type} (Copy)` }); setIsModalOpen(true); } };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div><h2 className="text-2xl font-black text-slate-800 dark:text-white">Bill Registry</h2><p className="text-sm text-slate-500 font-medium">Tracking organizational utility overheads.</p></div>
        <button onClick={() => { setEditingBill(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Plus size={20} /> New Record</button>
      </div>
      <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
            <th className="px-8 py-5 text-center">Paid?</th>
            <th className="px-8 py-5">Utility</th>
            <th className="px-8 py-5">Location</th>
            <th className="px-8 py-5">Ref #</th>
            <th className="px-8 py-5">Due Date</th>
            <th className="px-8 py-5">Amount</th>
            <th className="px-8 py-5 text-center">Status</th>
            <th className="px-8 py-5 text-right">Actions</th>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {bills.map(bill => {
              const isPaid = bill.status === 'Paid';
              return (
                <tr key={bill.id} className={`hover:bg-slate-50/30 transition-colors ${isPaid ? 'opacity-60 grayscale-[0.3]' : ''}`}>
                  <td className="px-8 py-5 text-center">
                    <button 
                      onClick={() => onUpdate(bill.id, { status: isPaid ? 'Pending' : 'Paid' })}
                      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${isPaid ? 'bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-200 text-white' : 'bg-white border-slate-200 text-transparent hover:border-indigo-400'}`}
                    >
                      <Check size={16} strokeWidth={4} />
                    </button>
                  </td>
                  <td className={`px-8 py-5 font-black text-sm transition-all ${isPaid ? 'line-through text-slate-400' : 'text-slate-800 dark:text-white'}`}>{bill.type}</td>
                  <td className="px-8 py-5 text-sm font-medium text-slate-500">{bill.location}</td>
                  <td className="px-8 py-5 text-[10px] font-mono font-bold text-slate-400">{bill.referenceNumber}</td>
                  <td className="px-8 py-5 text-sm font-bold">{format(new Date(bill.dueDate), 'MMM dd')}</td>
                  <td className={`px-8 py-5 font-black transition-all ${isPaid ? 'text-slate-400' : 'text-slate-800 dark:text-white'}`}>Rs. {bill.amount.toLocaleString()}</td>
                  <td className="px-8 py-5 text-center"><span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>{bill.status}</span></td>
                  <td className="px-8 py-5 text-right"><div className="flex justify-end gap-2"><button onClick={() => handleEdit(bill)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={18} /></button><button onClick={() => handleClone(bill.id)} className="p-2 text-slate-400 hover:text-indigo-600"><Copy size={18} /></button><button onClick={() => confirm('Delete?') && onDelete(bill.id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={18} /></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isModalOpen && <UtilityModal bill={editingBill} onClose={() => setIsModalOpen(false)} onSubmit={(data) => { if(editingBill?.id) onUpdate(editingBill.id, data); else onAdd(data); setIsModalOpen(false); }} />}
    </div>
  );
};

export const ReminderLibrary: React.FC<{
  reminders: Reminder[];
  onInstantiate: (reminder: Reminder) => void;
  onAdd: (reminder: Omit<Reminder, 'id' | 'displayId'>) => void;
  onUpdate: (id: string, updates: Partial<Reminder>) => void;
  onDelete: (id: string) => void;
  setView: (v: any) => void;
}> = ({ reminders, onInstantiate, onAdd, onUpdate, onDelete, setView }) => {
  const [activeTab, setActiveTab] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const filtered = reminders.filter(r => r.type === activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
       <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div><h2 className="text-2xl font-black text-slate-800 dark:text-white">Operation Library</h2><p className="text-sm text-slate-500 font-medium">Standard blueprints for recurring organizational tasks.</p></div>
        <button onClick={() => { setEditingReminder(null); setIsModalOpen(true); }} className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2"><Plus size={20} /> New Blueprint</button>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/30">
          {['Daily', 'Weekly', 'Monthly'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`flex-1 py-5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === tab ? 'text-indigo-600 border-indigo-600 bg-white dark:bg-slate-900' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>{tab}</button>
          ))}
        </div>
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
          {filtered.length > 0 ? filtered.map(reminder => (
            <div key={reminder.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
              <div>
                <h4 className="font-black text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors">{reminder.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">{reminder.displayId}</span>
                  <span className="text-xs text-slate-500 font-medium">{reminder.category} • {formatTime(reminder.estimatedTime)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { onInstantiate(reminder); setView('tasks'); }} className="w-10 h-10 flex items-center justify-center bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all"><Plus size={20} /></button>
                <button onClick={() => { setEditingReminder(reminder); setIsModalOpen(true); }} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-xl transition-all"><Edit2 size={16} /></button>
                <button onClick={() => confirm('Delete blueprint?') && onDelete(reminder.id)} className="w-10 h-10 flex items-center justify-center bg-rose-50 dark:bg-rose-900/10 text-rose-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={16} /></button>
              </div>
            </div>
          )) : <div className="py-20 text-center text-slate-400 italic">Library is empty for this recurrence type.</div>}
        </div>
      </div>
      {isModalOpen && <ReminderModal reminder={editingReminder} defaultType={activeTab} onClose={() => setIsModalOpen(false)} onSubmit={(data) => { if (editingReminder) onUpdate(editingReminder.id, data); else onAdd(data); setIsModalOpen(false); }} />}
    </div>
  );
};

const ReminderModal: React.FC<{ reminder?: Reminder | null; defaultType: RecurrenceType; onClose: () => void; onSubmit: (data: any) => void }> = ({ reminder, defaultType, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ title: reminder?.title || '', category: reminder?.category || CATEGORIES[0], priority: reminder?.priority || PRIORITIES[1], estimatedTime: reminder?.estimatedTime?.toString() || '30', type: (reminder?.type as any) || (defaultType as any) });
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[32px] shadow-2xl p-8 space-y-6 animate-in zoom-in-95 border border-white/10">
        <h2 className="text-xl font-black uppercase tracking-widest dark:text-white">{reminder ? 'Edit Blueprint' : 'New Library Entry'}</h2>
        <div className="space-y-4">
          <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Operation Title</label><input type="text" className="w-full px-5 py-4 border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 rounded-2xl outline-none dark:text-white font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} autoFocus /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label><select className="w-full px-4 py-4 border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 rounded-2xl dark:text-white font-bold" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label><select className="w-full px-4 py-4 border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 rounded-2xl dark:text-white font-bold" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Mins</label><input type="number" className="w-full px-4 py-4 border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 rounded-2xl dark:text-white font-bold" value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})} /></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label><select className="w-full px-4 py-4 border-2 border-slate-100 dark:border-slate-800 dark:bg-slate-950 rounded-2xl dark:text-white font-bold" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>{['Daily', 'Weekly', 'Monthly'].map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
        </div>
        <div className="flex gap-4 pt-4"><button onClick={onClose} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest">Discard</button><button onClick={() => formData.title && onSubmit({...formData, estimatedTime: parseInt(formData.estimatedTime) || 30})} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-indigo-700">Save Blueprint</button></div>
      </div>
    </div>
  );
};

export const Settings: React.FC<{ state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }> = ({ state, setState }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div><h2 className="text-3xl font-black tracking-tight dark:text-white">Account Control</h2><p className="text-sm text-slate-500 font-medium mt-1">Manage personal preferences and localized settings.</p></div>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-6 pb-6 border-b border-slate-50 dark:border-slate-800">
          <div className="w-16 h-16 rounded-[24px] bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-xl font-black text-white">{state.currentUser.name.charAt(0)}</div>
          <div><h4 className="font-black text-lg dark:text-white">{state.currentUser.name}</h4><p className="text-xs text-slate-400 font-bold uppercase">{state.currentUser.email} • {state.currentUser.role}</p></div>
        </div>
        <div className="space-y-4">
           <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <span className="text-xs font-black uppercase tracking-widest">Dark Interface</span>
            <button onClick={() => setState(prev => ({...prev, isDarkMode: !prev.isDarkMode}))} className={`w-12 h-7 rounded-full relative transition-colors ${state.isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${state.isDarkMode ? 'left-6' : 'left-1'}`} /></button>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
            <span className="text-xs font-black uppercase tracking-widest">Compact Layout</span>
            <button onClick={() => setState(prev => ({...prev, settings: {...prev.settings, layout: {...prev.settings.layout, compactMode: !prev.settings.layout.compactMode}}}))} className={`w-12 h-7 rounded-full relative transition-colors ${state.settings.layout.compactMode ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${state.settings.layout.compactMode ? 'left-6' : 'left-1'}`} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AdminPanel: React.FC<{ state: AppState; updateSettings: (s: AppSettings) => void; addUser: (u: Omit<User, 'id'>) => void; updateUser: (id: string, u: Partial<User>) => void; deleteUser: (id: string) => void; }> = ({ state, updateSettings, addUser, updateUser, deleteUser }) => {
  const [tab, setTab] = useState<'branding' | 'modules' | 'users' | 'logs'>('branding');
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      alert('System synchronized successfully!');
    }, 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div><h2 className="text-3xl font-black tracking-tight dark:text-white">Central Operations Panel</h2><p className="text-sm text-slate-500 font-medium">System governance and workforce oversight.</p></div>
        <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <button 
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 shrink-0"
          >
            {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
            {isPublishing ? 'PUBLISHING...' : 'PUBLISH CHANGES'}
          </button>
          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 shrink-0">
            {['branding', 'modules', 'users', 'logs'].map((t: any) => (
              <button key={t} onClick={() => setTab(t)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        {tab === 'branding' && (
          <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 rounded-[32px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Organization Name</label><input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white" value={state.settings.branding.orgName} onChange={e => updateSettings({...state.settings, branding: {...state.settings.branding, orgName: e.target.value}})} /></div>
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Footer Text</label><input type="text" className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold dark:text-white" value={state.settings.branding.footerText} onChange={e => updateSettings({...state.settings, branding: {...state.settings.branding, footerText: e.target.value}})} /></div>
          </div>
        )}
        
        {tab === 'modules' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.keys(state.settings.modules).map(mod => (
              <div key={mod} className={`p-6 rounded-[32px] border-2 transition-all cursor-pointer ${(state.settings.modules as any)[mod] ? 'bg-white dark:bg-slate-900 border-indigo-600 shadow-xl' : 'bg-slate-50 dark:bg-slate-800 border-transparent opacity-50'}`} onClick={() => updateSettings({...state.settings, modules: {...state.settings.modules, [mod]: !(state.settings.modules as any)[mod]}})}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${(state.settings.modules as any)[mod] ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}><Activity size={24} /></div>
                <h4 className="font-black text-sm uppercase tracking-widest dark:text-white">{mod.replace(/([A-Z])/g, ' $1')}</h4>
                <p className={`text-[9px] font-black uppercase mt-1 ${(state.settings.modules as any)[mod] ? 'text-indigo-600' : 'text-slate-400'}`}>{(state.settings.modules as any)[mod] ? 'Operational' : 'Disabled'}</p>
              </div>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl">
             <div className="p-8 border-b flex justify-between items-center"><h3 className="font-black uppercase tracking-widest dark:text-white">Personnel Registry</h3><button onClick={() => addUser({ name: 'New Staff', email: 'staff@org.com', role: 'Staff', suspended: false })} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest">Add User</button></div>
             <div className="overflow-x-auto"><table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-800 text-[9px] uppercase font-black text-slate-400 tracking-[0.2em]"><th className="px-8 py-5">Personnel</th><th className="px-8 py-5">Role</th><th className="px-8 py-5">Status</th><th className="px-8 py-5 text-right">Actions</th></thead><tbody className="divide-y divide-slate-50 dark:divide-slate-800">{state.users.map(u => (<tr key={u.id} className="hover:bg-slate-50/50 transition-colors"><td className="px-8 py-4"><p className="font-bold dark:text-white">{u.name}</p><p className="text-[10px] text-slate-400 font-bold uppercase">{u.email}</p></td><td className="px-8 py-4"><select className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-[10px] font-black uppercase outline-none dark:text-white" value={u.role} onChange={e => updateUser(u.id, { role: e.target.value as any })}>{ROLES.map(r => <option key={r}>{r}</option>)}</select></td><td className="px-8 py-4"><span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase ${u.suspended ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>{u.suspended ? 'LOCKED' : 'ACTIVE'}</span></td><td className="px-8 py-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => updateUser(u.id, { suspended: !u.suspended })} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl"><Lock size={18} /></button><button onClick={() => deleteUser(u.id)} className="p-2 text-slate-400 hover:text-rose-500 rounded-xl"><Trash2 size={18} /></button></div></td></tr>))}</tbody></table></div>
          </div>
        )}

        {tab === 'logs' && (
          <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 overflow-hidden shadow-xl max-h-[600px] overflow-y-auto">
             <div className="p-8 border-b sticky top-0 bg-white dark:bg-slate-900 z-10 flex justify-between items-center"><h3 className="font-black uppercase tracking-widest dark:text-white">Real-time Activity Log</h3><Activity size={20} className="text-indigo-600" /></div>
             <div className="divide-y divide-slate-50 dark:divide-slate-800">
               {state.auditLogs.map(log => (<div key={log.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors"><div className="space-y-1"><p className="text-sm font-bold dark:text-white">{log.action}</p><p className="text-[10px] font-black uppercase text-indigo-500">{log.userName} • {log.module}</p></div><span className="text-[10px] font-mono font-bold text-slate-400">{format(new Date(log.timestamp), 'HH:mm')}</span></div>))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdminLoginModal: React.FC<{ onClose: () => void; onLogin: (success: boolean) => void }> = ({ onClose, onLogin }) => {
  const [passcode, setPasscode] = useState(''); const [error, setError] = useState(false);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); if (passcode === '9988') onLogin(true); else { setError(true); setTimeout(() => setError(false), 1500); } };
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-lg">
      <div className="bg-white dark:bg-slate-900 w-full max-w-[400px] rounded-[40px] shadow-2xl p-10 border border-white/10 animate-in zoom-in-95">
        <div className="flex flex-col items-center text-center space-y-6 mb-10">
          <div className="w-20 h-20 bg-indigo-600 rounded-[28px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40"><Fingerprint size={40} /></div>
          <div><h2 className="text-xl font-black uppercase tracking-[0.3em] dark:text-white">Authorized</h2><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnel Verification Gateway</p></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="password" placeholder="Enter Access Key" className={`w-full px-6 py-5 bg-slate-100 dark:bg-slate-800 rounded-[24px] border-2 transition-all text-center text-3xl font-black tracking-[0.5em] outline-none ${error ? 'border-rose-500 animate-shake' : 'border-transparent focus:border-indigo-600 dark:text-white'}`} value={passcode} onChange={e => setPasscode(e.target.value)} autoFocus />
          <div className="flex gap-4 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-4 text-slate-400 font-black text-[10px] uppercase tracking-widest">Abort</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl active:scale-95">Verify</button>
          </div>
        </form>
      </div>
    </div>
  );
};
