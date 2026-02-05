
import { Task, UtilityBill, RecurrenceType, Reminder, AppSettings, User, Permission, Role } from './types';

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_REMINDERS: Reminder[] = [
  { id: 'r1', displayId: 'D-01', title: 'Donation & Receipt Management', category: 'Finance', priority: 'High', estimatedTime: 45, type: 'Daily' },
  { id: 'r2', displayId: 'D-02', title: 'Coin Box Management', category: 'Operations', priority: 'Medium', estimatedTime: 30, type: 'Daily' },
  { id: 'r3', displayId: 'D-03', title: 'Expense Recording', category: 'Finance', priority: 'High', estimatedTime: 60, type: 'Daily' },
  { id: 'r4', displayId: 'D-04', title: 'Daily Cash Reconciliation', category: 'Finance', priority: 'High', estimatedTime: 30, type: 'Daily' },
  { id: 'r5', displayId: 'D-05', title: 'Security Guard Payment Processing', category: 'Admin', priority: 'Medium', estimatedTime: 15, type: 'Daily' },
  { id: 'r6', displayId: 'W-01', title: 'Weekly Expense Review', category: 'Finance', priority: 'High', estimatedTime: 120, type: 'Weekly' },
  { id: 'r7', displayId: 'W-02', title: 'Vendor Payment Follow-ups', category: 'Finance', priority: 'Medium', estimatedTime: 90, type: 'Weekly' },
  { id: 'r8', displayId: 'W-03', title: 'Staff Attendance Review', category: 'HR', priority: 'Medium', estimatedTime: 45, type: 'Weekly' },
  { id: 'r9', displayId: 'M-01', title: 'Monthly Accounts Closing', category: 'Finance', priority: 'High', estimatedTime: 240, type: 'Monthly' },
  { id: 'r10', displayId: 'M-02', title: 'Utility Bill Management', category: 'Finance', priority: 'High', estimatedTime: 60, type: 'Monthly' },
  { id: 'r11', displayId: 'M-03', title: 'Salary Processing', category: 'HR', priority: 'High', estimatedTime: 180, type: 'Monthly' },
  { id: 'r12', displayId: 'M-04', title: 'Financial Summary Report', category: 'Finance', priority: 'High', estimatedTime: 120, type: 'Monthly' },
];

export const DEFAULT_PERMISSIONS: Permission = {
  viewTasks: true,
  editTasks: true,
  startTimer: true,
  editTime: true,
  downloadReports: true,
  manageBills: true,
  manageUsers: false,
  manageSettings: false,
};

export const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Hashmi Admin', email: 'admin@hashmi.com', role: 'Super Admin', suspended: false },
  { id: 'u2', name: 'Standard Staff', email: 'staff@hashmi.com', role: 'Staff', suspended: false },
];

export const INITIAL_SETTINGS: AppSettings = {
  branding: {
    orgName: 'Hashmi Ops',
    logoUrl: '',
    footerText: 'Powered by TTM by Hashmi © 2024',
    showSpiritualHeader: true,
  },
  layout: {
    sidebarEnabled: true,
    topbarEnabled: true,
    compactMode: false,
    landingPage: 'dashboard',
  },
  modules: {
    taskManager: true,
    timeTracking: true,
    reminderLibrary: true,
    utilityBills: true,
    analytics: true,
  },
  trackingRules: {
    autoStartTimer: false,
    allowManualTimeEdit: true,
    maxDailyHours: 8,
    currency: 'PKR',
  },
  rolePermissions: {
    'Super Admin': { ...DEFAULT_PERMISSIONS, manageUsers: true, manageSettings: true },
    'Admin': { ...DEFAULT_PERMISSIONS, manageUsers: true, manageSettings: true },
    'Manager': { ...DEFAULT_PERMISSIONS, manageUsers: false, manageSettings: false },
    'Staff': { ...DEFAULT_PERMISSIONS, manageBills: false, manageUsers: false, manageSettings: false, editTime: false },
  },
};

export const INITIAL_BILLS: UtilityBill[] = [
  { id: 'b1', type: 'Storm Fiber', location: 'Main Campus', contactNumber: '0333-3265994', referenceNumber: 'SF-MAIN-001', month: 'May 2024', dueDate: '2024-05-15', amount: 3500, status: 'Pending' },
  { id: 'b2', type: 'Storm Fiber', location: 'Main Campus', contactNumber: '0300-2225354', referenceNumber: 'SF-MAIN-002', month: 'May 2024', dueDate: '2024-05-15', amount: 4200, status: 'Pending' },
  { id: 'b3', type: 'PTCL', location: 'Main Campus', contactNumber: '021-34613474', referenceNumber: '02134613474', month: 'May 2024', dueDate: '2024-05-20', amount: 2800, status: 'Pending' },
  { id: 'b4', type: 'K-Electric', location: 'Main Campus', referenceNumber: '0400030577440', month: 'May 2024', dueDate: '2024-05-18', amount: 15400, status: 'Pending' },
  { id: 'b5', type: 'SSGC (Gas)', location: 'Main Campus', referenceNumber: '2490615583', month: 'May 2024', dueDate: '2024-05-12', amount: 850, status: 'Paid' },
];

export const CATEGORIES = ['Operations', 'Finance', 'Administration', 'IT', 'Maintenance', 'HR'];
export const PRIORITIES: ('Low' | 'Medium' | 'High')[] = ['Low', 'Medium', 'High'];
export const RECURRENCE_TYPES: RecurrenceType[] = ['One-time', 'Daily', 'Weekly', 'Monthly'];
export const CAMPUSES = ['Main Campus', 'Johar Campus', 'Masjid Campus', 'Maktab Campus'];
export const ROLES: Role[] = ['Super Admin', 'Admin', 'Manager', 'Staff'];
