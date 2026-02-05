
import { Task, UtilityBill, RecurrenceType } from './types';

export const INITIAL_TASKS: Task[] = [
  {
    id: 'd1',
    title: 'Donation & Receipt Management',
    category: 'Finance',
    priority: 'High',
    estimatedTime: 45,
    actualTime: 0,
    dueDate: new Date().toISOString().split('T')[0],
    type: 'Daily',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'd2',
    title: 'Coin Box Management',
    category: 'Operations',
    priority: 'Medium',
    estimatedTime: 30,
    actualTime: 0,
    dueDate: new Date().toISOString().split('T')[0],
    type: 'Daily',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'w1',
    title: 'Weekly Expense Review',
    category: 'Finance',
    priority: 'High',
    estimatedTime: 120,
    actualTime: 0,
    dueDate: new Date().toISOString().split('T')[0],
    type: 'Weekly',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  }
];

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
