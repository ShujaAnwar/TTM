
import React, { useState, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Receipt, 
  BarChart3, 
  Settings as SettingsIcon, 
  Plus, 
  Play, 
  Pause, 
  Check, 
  Clock, 
  MoreVertical, 
  Moon, 
  Sun, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Download,
  Filter,
  Trash2,
  AlertCircle,
  FileText,
  User,
  Paperclip,
  Loader2,
  Copy,
  Calendar
} from 'lucide-react';
import { Task, UtilityBill, AppState, Priority, RecurrenceType } from '../types';
import { CATEGORIES, PRIORITIES, RECURRENCE_TYPES, CAMPUSES } from '../constants';
import { format, differenceInDays, startOfWeek, endOfWeek, isSameDay, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- Shared UI Components ---

export const Layout: React.FC<{
  children: React.ReactNode;
  currentView: string;
  setView: (v: any) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}> = ({ children, currentView, setView, isDarkMode, toggleDarkMode }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <Clock size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">TTM by Hashmi</span>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Dashboard" active={currentView === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavItem icon={<CheckSquare size={20} />} label="Task Manager" active={currentView === 'tasks'} onClick={() => setView('tasks')} />
          <NavItem icon={<Receipt size={20} />} label="Utility Bills" active={currentView === 'utilities'} onClick={() => setView('utilities')} />
          <NavItem icon={<BarChart3 size={20} />} label="Analytics" active={currentView === 'reports'} onClick={() => setView('reports')} />
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
            <NavItem icon={<SettingsIcon size={20} />} label="Settings" active={currentView === 'settings'} onClick={() => setView('settings')} />
          </div>
        </nav>
        <div className="p-4">
          <button 
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <span className="text-sm font-medium">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
            {isDarkMode ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-amber-500" />}
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-slate-50 dark:bg-slate-950">
        {/* Spiritual Header */}
        <div className="w-full py-3 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center px-4 shrink-0 transition-colors">
          <h2 className="font-arabic text-xl md:text-2xl text-indigo-600 dark:text-indigo-400 font-bold mb-1">
            بسم الله الرحمن الرحیم
          </h2>
          <p className="font-arabic text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed italic">
            اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا
          </p>
        </div>

        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-600 dark:text-slate-400 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <LayoutDashboard size={24} />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 dark:text-white capitalize">
              {currentView.replace('-', ' ')}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
              <Clock size={16} className="text-indigo-600 dark:text-indigo-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {format(new Date(), 'MMM dd, yyyy • HH:mm')}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white dark:ring-slate-800">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50 dark:bg-slate-950">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none font-medium' 
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);

// --- Dashboard View ---

export const Dashboard: React.FC<{ 
  state: AppState; 
  onStart: (id: string) => void; 
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
}> = ({ state, onStart, onPause, onComplete }) => {
  const todayTasks = useMemo(() => state.tasks.filter(t => isSameDay(new Date(t.dueDate), new Date())), [state.tasks]);
  const completedToday = todayTasks.filter(t => t.status === 'Completed').length;
  const inProgress = state.tasks.filter(t => t.status === 'In Progress');
  const totalActual = todayTasks.reduce((acc, t) => acc + (t.actualTime || 0), 0);
  const totalEstimated = todayTasks.reduce((acc, t) => acc + (t.estimatedTime || 0), 0);
  const productivityScore = totalEstimated > 0 ? Math.round((totalActual / totalEstimated) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Productivity Score" value={`${productivityScore}%`} icon={<BarChart3 className="text-indigo-600 dark:text-indigo-400" />} trend={productivityScore > 80 ? 'up' : 'down'} subtitle="Actual vs Estimated Time" />
        <StatCard title="Daily Goal" value={`${completedToday}/${todayTasks.length}`} icon={<CheckSquare className="text-emerald-600 dark:text-emerald-400" />} subtitle="Tasks Completed Today" />
        <StatCard title="Time Tracked" value={formatTime(totalActual)} icon={<Clock className="text-amber-600 dark:text-amber-400" />} subtitle="Total Working Hours" />
        <StatCard title="Utility Status" value={state.bills.filter(b => b.status === 'Pending').length.toString()} icon={<Receipt className="text-rose-600 dark:text-rose-400" />} subtitle="Pending Bill Payments" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Play size={18} className="text-indigo-600 dark:text-indigo-400" /> In Progress
              </h2>
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-full">
                {inProgress.length} ACTIVE
              </span>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {inProgress.length > 0 ? (
                inProgress.map(task => (
                  <ActiveTaskRow key={task.id} task={task} onPause={() => onPause(task.id)} onComplete={() => onComplete(task.id)} />
                ))
              ) : (
                <div className="p-12 text-center text-slate-400">
                  <Play size={48} className="mx-auto mb-4 opacity-10" />
                  <p className="text-sm">No tasks currently in progress. Start one from the Task Manager.</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">Upcoming Deadlines</h2>
              <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">View All</button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {state.tasks.filter(t => t.status !== 'Completed').slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                    <div className={`w-2 h-10 rounded-full ${getPriorityColor(task.priority)} ${task.priority === 'High' ? 'animate-blink shadow-[0_0_10px_rgba(244,63,94,0.4)]' : ''}`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-800 dark:text-white line-clamp-1">{task.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                        <Clock size={12} /> {formatTime(task.estimatedTime)} • Due {format(new Date(task.dueDate), 'MMM dd')}
                      </p>
                    </div>
                    {task.status === 'In Progress' ? (
                      <button onClick={() => onPause(task.id)} className="p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-all"><Pause size={20} /></button>
                    ) : (
                      <button onClick={() => onStart(task.id)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all"><Play size={20} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Task Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={[{ name: 'Pending', value: state.tasks.filter(t => t.status === 'Pending').length }, { name: 'In Progress', value: state.tasks.filter(t => t.status === 'In Progress').length }, { name: 'Completed', value: state.tasks.filter(t => t.status === 'Completed').length }]} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    <Cell fill="#6366f1" /><Cell fill="#fbbf24" /><Cell fill="#10b981" />
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} /><Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-indigo-100 dark:shadow-none">
             <div className="absolute top-0 right-0 p-8 opacity-10"><Receipt size={120} /></div>
             <h3 className="text-lg font-bold mb-2">Operational Insight</h3>
             <p className="text-indigo-100 text-sm mb-4 leading-relaxed">You have <strong>{state.bills.filter(b => b.status === 'Pending').length} pending bills</strong> that require attention.</p>
             <button className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-bold shadow-lg hover:bg-indigo-50 transition-colors">Handle Payments</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Task Manager View ---

export const Tasks: React.FC<{
  tasks: Task[];
  onAdd: (task: any) => void;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (id: string) => void;
  activeTaskId: string | null;
}> = ({ tasks, onAdd, onUpdate, onDelete, onStart, onPause, onComplete, activeTaskId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<RecurrenceType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTasks = useMemo(() => {
    return (tasks || []).filter(t => {
      if (!t) return false;
      const matchesFilter = filterType === 'All' || t.type === filterType;
      const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || (t.category || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [tasks, filterType, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input type="text" placeholder="Search tasks or categories..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium outline-none dark:text-white" value={filterType} onChange={(e) => setFilterType(e.target.value as any)}>
            <option value="All">All Types</option>
            {RECURRENCE_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
          </select>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95">
            <Plus size={20} /><span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.length > 0 ? filteredTasks.map(task => (<TaskCard key={task.id} task={task} onStart={() => onStart(task.id)} onPause={() => onPause(task.id)} onComplete={() => onComplete(task.id)} onDelete={() => onDelete(task.id)} isActive={task.status === 'In Progress'} />)) : (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-10" /><p className="text-lg">No tasks found.</p>
          </div>
        )}
      </div>
      {isModalOpen && <TaskModal onClose={() => setIsModalOpen(false)} onSubmit={onAdd} />}
    </div>
  );
};

// --- Utility Management View ---

export const Utilities: React.FC<{ bills: UtilityBill[]; onAdd: (bill: any) => void; onUpdate: (id: string, updates: any) => void }> = ({ bills, onAdd, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<any>(null);

  const handleClone = (bill: UtilityBill) => {
    const { id, ...clonedData } = bill;
    setEditingBill({ ...clonedData, status: 'Pending', month: format(new Date(), 'MMMM yyyy') });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div><h2 className="text-xl font-bold text-slate-800 dark:text-white">Utility Bill Management</h2><p className="text-sm text-slate-500 dark:text-slate-400">Track and manage monthly campus utilities</p></div>
          <button onClick={() => { setEditingBill(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-indigo-700 transition-all"><Plus size={18} /> Add New Bill</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Utility Type</th>
                <th className="px-6 py-4 font-bold">Ref / Consumer #</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold text-sm">Due Date</th>
                <th className="px-6 py-4 font-bold text-right text-sm">Amount (PKR)</th>
                <th className="px-6 py-4 font-bold text-center text-sm">Status</th>
                <th className="px-6 py-4 font-bold text-center text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {bills.map(bill => (
                <tr key={bill.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center"><Receipt size={16} /></div><span className="font-semibold text-slate-800 dark:text-white">{bill.type}</span></div></td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 font-mono">{bill.referenceNumber}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{bill.location}</td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-white">{bill.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => onUpdate(bill.id, { status: bill.status === 'Paid' ? 'Pending' : 'Paid' })} className={`px-3 py-1 rounded-full text-xs font-bold ${bill.status === 'Paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{bill.status}</button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => handleClone(bill)} title="Clone Bill" className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"><Copy size={18} /></button>
                      <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"><MoreVertical size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <UtilityModal bill={editingBill} onClose={() => setIsModalOpen(false)} onSubmit={onAdd} />}
    </div>
  );
};

const UtilityModal: React.FC<{ bill?: any; onClose: () => void; onSubmit: (data: any) => void }> = ({ bill, onClose, onSubmit }) => {
  const [formData, setFormData] = useState(bill || {
    type: 'Storm Fiber',
    location: CAMPUSES[0],
    referenceNumber: '',
    contactNumber: '',
    month: format(new Date(), 'MMMM yyyy'),
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    amount: 0,
    status: 'Pending',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">{bill ? 'Clone Utility Bill' : 'New Utility Bill'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><MoreVertical size={20} className="rotate-90" /></button>
        </div>
        <div className="p-8 space-y-4">
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Utility Type</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none dark:text-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase">Location</label>
              <select className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none dark:text-white" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})}>
                {CAMPUSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Amount (PKR)</label><input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none dark:text-white" value={formData.amount} onChange={e => setFormData({...formData, amount: parseInt(e.target.value) || 0})} /></div>
          </div>
          <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Reference Number</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none dark:text-white" value={formData.referenceNumber} onChange={e => setFormData({...formData, referenceNumber: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Due Date</label><input type="date" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none dark:text-white" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} /></div>
             <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Month</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 outline-none dark:text-white" value={formData.month} onChange={e => setFormData({...formData, month: e.target.value})} /></div>
          </div>
        </div>
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-4">
          <button onClick={onClose} className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800">Discard</button>
          <button onClick={() => { if(!formData.referenceNumber) return alert('Ref is required'); onSubmit(formData); onClose(); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl hover:bg-indigo-700">Save Bill</button>
        </div>
      </div>
    </div>
  );
}

// --- Reporting View ---

export const Reports: React.FC<{ state: AppState }> = ({ state }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fromDate, setFromDate] = useState(format(startOfWeek(new Date()), 'yyyy-MM-dd'));
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const filteredTasks = useMemo(() => {
    const start = startOfDay(parseISO(fromDate));
    const end = endOfDay(parseISO(toDate));
    return state.tasks.filter(t => {
      const taskDate = parseISO(t.dueDate);
      return taskDate >= start && taskDate <= end;
    });
  }, [state.tasks, fromDate, toDate]);

  const filteredBills = useMemo(() => {
    const start = startOfDay(parseISO(fromDate));
    const end = endOfDay(parseISO(toDate));
    return state.bills.filter(b => {
      const billDate = parseISO(b.dueDate);
      return billDate >= start && billDate <= end;
    });
  }, [state.bills, fromDate, toDate]);

  const completedTasks = useMemo(() => filteredTasks.filter(t => t.status === 'Completed'), [filteredTasks]);
  const pendingTasksCount = filteredTasks.filter(t => t.status !== 'Completed').length;
  const totalActual = completedTasks.reduce((acc, t) => acc + (t.actualTime || 0), 0);
  const totalEstimated = filteredTasks.reduce((acc, t) => acc + (t.estimatedTime || 0), 0);

  const handleExportPDF = async () => {
    setIsGenerating(true); setErrorMessage(null);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const primaryColor = [99, 102, 241]; const textColor = [30, 41, 59];
      doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('TTM BY HASHMI', 20, 20);
      doc.setFontSize(14); doc.setTextColor(textColor[0], textColor[1], textColor[2]); doc.text('Operational Performance Report', 20, 30);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); 
      doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 20, 38);
      doc.text(`Reporting Period: ${format(parseISO(fromDate), 'MMM dd, yyyy')} to ${format(parseISO(toDate), 'MMM dd, yyyy')}`, 20, 44);
      
      doc.setDrawColor(226, 232, 240); doc.line(20, 50, 190, 50);
      
      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Summary Statistics', 20, 60);
      const stats = [ 
        { label: 'Total Tasks', value: filteredTasks.length.toString() }, 
        { label: 'Completed', value: completedTasks.length.toString() }, 
        { label: 'Pending', value: pendingTasksCount.toString() }, 
        { label: 'Total Time Tracked', value: formatTime(totalActual) }, 
        { label: 'Efficiency Index', value: totalActual > 0 ? `${Math.round((totalEstimated/totalActual)*100)}%` : 'N/A' },
        { label: 'Bills in Range', value: filteredBills.length.toString() }
      ];
      
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
      stats.forEach((stat, idx) => { 
        const yPos = 70 + (idx * 8); 
        doc.text(`${stat.label}:`, 25, yPos); 
        doc.setFont('helvetica', 'bold'); 
        doc.text(stat.value, 65, yPos); 
        doc.setFont('helvetica', 'normal'); 
      });

      doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.text('Task Log', 20, 125);
      const tableData = filteredTasks.map(task => [ 
        task.title || 'Untitled', 
        task.category || 'General', 
        task.status || 'Pending', 
        formatTime(task.estimatedTime || 0), 
        formatTime(task.actualTime || 0),
        task.dueDate
      ]);
      
      autoTable(doc, { 
        startY: 130, 
        head: [['Task', 'Category', 'Status', 'Est. Time', 'Act. Time', 'Due Date']], 
        body: tableData, 
        headStyles: { fillColor: primaryColor, textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold' }, 
        bodyStyles: { fontSize: 8, textColor: textColor }, 
        alternateRowStyles: { fillColor: [248, 250, 252] }, 
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => { 
          const pageCount = doc.getNumberOfPages(); 
          doc.setFont('helvetica', 'italic'); doc.setFontSize(8); doc.setTextColor(148, 163, 184); 
          doc.text(`TTM by Hashmi - Generated Report - Page ${data.pageNumber} of ${pageCount}`, data.settings.margin.left, doc.internal.pageSize.height - 10); 
        } 
      });

      const filename = `TTM_Report_${fromDate}_to_${toDate}.pdf`;
      doc.save(filename);
    } catch (err) { console.error('PDF Error:', err); setErrorMessage('Failed to generate PDF.'); } finally { setIsGenerating(false); }
  };

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(d.getDate() - i); return format(d, 'EEE'); }).reverse();
    return last7Days.map(day => ({ name: day, tasks: Math.floor(Math.random() * 5) + 1 }));
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Reporting Engine</h2>
            <p className="text-slate-500 dark:text-slate-400">Select a range to analyze and export operational data.</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date" 
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input 
                  type="date" 
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <button 
          onClick={handleExportPDF} 
          disabled={isGenerating} 
          className={`flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50`}
        >
          {isGenerating ? <><Loader2 size={20} className="animate-spin" /> Preparing PDF...</> : <><Download size={20} /> Download Report</>}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Trend Analysis</h3>
              <span className="text-xs text-slate-400 font-medium">Auto-generated for range</span>
            </div>
            <div className="h-80 w-full"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} /><Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} /><Bar dataKey="tasks" fill="#6366f1" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Activity Log (Range Selected)</h3>
            <div className="space-y-4">
              {filteredTasks.length > 0 ? filteredTasks.slice(0, 10).map(task => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">{task.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{task.category} • Scheduled: {task.dueDate}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${task.status === 'Completed' ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>{task.status}</p>
                    <p className="text-[10px] text-slate-400">Act: {formatTime(task.actualTime)}</p>
                  </div>
                </div>
              )) : <div className="py-12 text-center text-slate-400 italic">No tasks recorded for this period.</div>}
            </div>
          </div>
        </div>
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8 text-center">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-4">Range Performance</h3>
            <div className="inline-flex items-center justify-center w-36 h-36 rounded-full border-[10px] border-indigo-50 dark:border-indigo-900/30 relative">
              <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                {totalActual > 0 ? Math.round((totalEstimated/totalActual)*100) : 0}%
              </span>
            </div>
            <p className="mt-6 text-sm text-slate-500 leading-relaxed px-4">Based on {completedTasks.length} completed tasks in the selected date range.</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6">Financial Range Summary</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800"><span className="text-sm text-slate-500 dark:text-slate-400">Paid Bills</span><span className="font-bold text-emerald-500">Rs. {filteredBills.filter(b => b.status === 'Paid').reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}</span></div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800"><span className="text-sm text-slate-500 dark:text-slate-400">Pending Bills</span><span className="font-bold text-amber-500">Rs. {filteredBills.filter(b => b.status === 'Pending').reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}</span></div>
              <div className="flex justify-between py-2 pt-4"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">Total Obligation</span><span className="font-black text-slate-800 dark:text-white">Rs. {filteredBills.reduce((acc, b) => acc + (b.amount || 0), 0).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Settings View ---

export const Settings: React.FC<{ state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }> = ({ state, setState }) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">User Profile</h3>
        <div className="flex items-center gap-6 mb-8"><div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-black">AD</div><div><h4 className="text-lg font-bold text-slate-800 dark:text-white">Admin User</h4><p className="text-slate-500">ops-admin@organization.org</p></div></div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl"><div className="flex items-center gap-3"><Moon size={20} className="text-slate-500 dark:text-slate-400" /><span className="font-medium text-slate-700 dark:text-slate-200">Dark Mode</span></div><button onClick={() => setState(prev => ({ ...prev, isDarkMode: !prev.isDarkMode }))} className={`w-12 h-6 rounded-full relative transition-colors ${state.isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${state.isDarkMode ? 'left-7' : 'left-1'}`} /></button></div>
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-8"><button onClick={() => { if(confirm('Reset all data?')) { localStorage.removeItem('chronos_state'); window.location.reload(); } }} className="w-full flex items-center justify-between p-4 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"><span className="font-medium">Reset Data</span><Trash2 size={18} /></button></div>
    </div>
  );
};

// --- Subcomponents ---

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; trend?: 'up' | 'down'; subtitle?: string }> = ({ title, value, icon, trend, subtitle }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><div className="flex justify-between mb-4"><div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">{icon}</div>{trend && <span className={`text-xs font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>{trend === 'up' ? '↑' : '↓'} 12%</span>}</div><h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3><p className="text-2xl font-bold mt-1 text-slate-800 dark:text-white">{value}</p></div>
);

const ActiveTaskRow: React.FC<{ task: Task; onPause: () => void; onComplete: () => void }> = ({ task, onPause, onComplete }) => (
  <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4"><div className="flex items-center gap-4"><div className={`w-1.5 h-12 rounded-full bg-amber-400 ${task.priority === 'High' ? 'bg-rose-500 animate-blink shadow-[0_0_8px_rgba(244,63,94,0.6)]' : ''}`} /><div><h4 className="font-bold text-slate-800 dark:text-white text-lg">{task.title}</h4><div className="flex gap-2 text-xs mt-1 text-slate-400"><span>{task.category}</span>•<span>{formatTime(task.actualTime)} / {formatTime(task.estimatedTime)}</span></div></div></div><div className="flex gap-2"><button onClick={onPause} className="px-4 py-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl font-bold">Pause</button><button onClick={onComplete} className="px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-100 dark:shadow-none">Complete</button></div></div>
);

const TaskCard: React.FC<{ task: Task; onStart: () => void; onPause: () => void; onComplete: () => void; onDelete: () => void; isActive: boolean }> = ({ task, onStart, onPause, onComplete, onDelete, isActive }) => (
  <div className={`p-6 bg-white dark:bg-slate-900 rounded-2xl border transition-all ${isActive ? 'ring-2 ring-indigo-500 border-transparent shadow-xl' : 'border-slate-200 dark:border-slate-800 shadow-sm'}`}>
    <div className="flex justify-between mb-4"><span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">{task.type}</span><button onClick={onDelete} className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button></div>
    <h3 className="text-lg font-bold text-slate-800 dark:text-white leading-tight min-h-[3rem] mb-2">{task.title}</h3>
    <div className="flex items-center gap-2 mb-6"><div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} ${task.priority === 'High' ? 'animate-blink shadow-[0_0_8px_rgba(244,63,94,0.6)]' : ''}`} /><span className="text-xs text-slate-500 dark:text-slate-400">{task.priority} Priority • {task.category}</span></div>
    <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-6"><div><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Est.</p><p className="text-sm font-bold text-slate-800 dark:text-white">{formatTime(task.estimatedTime)}</p></div><div><p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase">Actual</p><p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatTime(task.actualTime)}</p></div></div>
    <div className="flex gap-2">{task.status === 'Completed' ? <div className="w-full py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold text-center">Completed</div> : isActive ? <><button onClick={onPause} className="flex-1 py-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-xl font-bold">Pause</button><button onClick={onComplete} className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-bold">Complete</button></> : <button onClick={onStart} className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none">Start Work</button>}</div>
  </div>
);

const TaskModal: React.FC<{ onClose: () => void; onSubmit: (data: any) => void }> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ title: '', category: CATEGORIES[0], priority: PRIORITIES[1], estimatedTime: '30', type: RECURRENCE_TYPES[0], dueDate: format(new Date(), 'yyyy-MM-dd') });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl p-8 space-y-6">
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">New Operational Task</h2>
        <div className="space-y-4">
          <div><label className="text-xs font-bold text-slate-500 uppercase">Title</label><input type="text" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl outline-none dark:text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} autoFocus /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Category</label><select className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl dark:text-white" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Priority</label><select className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl dark:text-white" value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value as any})}>{PRIORITIES.map(p => <option key={p}>{p}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Time (Min)</label><input type="number" className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl dark:text-white" value={formData.estimatedTime} onChange={e => setFormData({...formData, estimatedTime: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">Type</label><select className="w-full px-4 py-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl dark:text-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})}>{RECURRENCE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
          </div>
        </div>
        <div className="flex gap-4"><button onClick={onClose} className="flex-1 py-3 text-slate-500 font-bold hover:text-slate-700 dark:hover:text-slate-300">Discard</button><button onClick={() => { if(!formData.title.trim()) return; onSubmit({...formData, estimatedTime: parseInt(formData.estimatedTime) || 30}); onClose(); }} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all">Create Task</button></div>
      </div>
    </div>
  );
}

const formatTime = (minutes: number = 0) => {
  const safeMinutes = Math.max(0, minutes || 0); const h = Math.floor(safeMinutes / 60); const m = Math.floor(safeMinutes % 60); const s = Math.floor((safeMinutes * 60) % 60);
  return h > 0 ? `${h}h ${m}m` : m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const getPriorityColor = (p: Priority) => {
  switch (p) { case 'High': return 'bg-rose-500'; case 'Medium': return 'bg-amber-500'; case 'Low': return 'bg-emerald-500'; default: return 'bg-slate-400'; }
};
