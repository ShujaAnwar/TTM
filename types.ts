
export type Priority = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type RecurrenceType = 'One-time' | 'Daily' | 'Weekly' | 'Monthly';

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

export interface AppState {
  tasks: Task[];
  bills: UtilityBill[];
  isDarkMode: boolean;
  activeTaskId: string | null;
}
