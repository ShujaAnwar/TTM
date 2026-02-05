
export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type RecurrenceType = 'One-time' | 'Daily' | 'Weekly' | 'Monthly';
export type Role = 'Super Admin' | 'Admin' | 'Manager' | 'Staff';

export interface Permission {
  viewTasks: boolean;
  editTasks: boolean;
  startTimer: boolean;
  editTime: boolean;
  downloadReports: boolean;
  manageBills: boolean;
  manageUsers: boolean;
  manageSettings: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  suspended: boolean;
  lastLogin?: string;
}

export interface Task {
  id: string;
  title: string;
  category: string;
  priority: Priority;
  estimatedTime: number; // in minutes
  actualTime: number; // in minutes
  dueDate: string;
  type: RecurrenceType;
  status: TaskStatus;
  startTime?: number; // timestamp
  lastPausedAt?: number; // timestamp
  completedAt?: string;
  createdAt: string;
}

export interface Reminder {
  id: string;
  displayId: string;
  title: string;
  category: string;
  priority: Priority;
  estimatedTime: number;
  type: 'Daily' | 'Weekly' | 'Monthly';
}

export interface UtilityBill {
  id: string;
  type: string;
  location: string;
  referenceNumber: string;
  contactNumber?: string;
  month: string;
  dueDate: string;
  amount: number;
  status: 'Pending' | 'Paid';
  attachmentUrl?: string;
}

export interface AppSettings {
  branding: {
    orgName: string;
    logoUrl: string;
    footerText: string;
    showSpiritualHeader: boolean;
  };
  layout: {
    sidebarEnabled: boolean;
    topbarEnabled: boolean;
    compactMode: boolean;
    landingPage: 'dashboard' | 'tasks' | 'library' | 'utilities';
  };
  modules: {
    taskManager: boolean;
    timeTracking: boolean;
    reminderLibrary: boolean;
    utilityBills: boolean;
    analytics: boolean;
  };
  trackingRules: {
    autoStartTimer: boolean;
    allowManualTimeEdit: boolean;
    maxDailyHours: number;
    currency: string;
  };
  rolePermissions: Record<Role, Permission>;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
}

export interface AppState {
  tasks: Task[];
  bills: UtilityBill[];
  reminders: Reminder[];
  users: User[];
  auditLogs: AuditLog[];
  settings: AppSettings;
  isDarkMode: boolean;
  activeTaskId: string | null;
  currentUser: User;
}
