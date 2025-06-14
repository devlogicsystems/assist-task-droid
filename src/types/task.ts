
export type TaskStatus = 'assigned' | 'in-progress' | 'closed';

export interface Task {
  id: string;
  subject: string;
  details?: string;
  assignee: string;
  dueDate: string; // YYYY-MM-DD format
  dueTime?: string; // HH:MM format
  reminderTime?: string; // HH:MM format
  status: TaskStatus;
  labels: string[];
  isFullDay: boolean;
  url?: string;
  attachments?: TaskAttachment[];
  recurrence?: TaskRecurrence;
  recurrenceTemplateId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

interface RecurrenceBase {
  interval: number;
  endDate?: string;
}

export interface WeeklyRecurrence extends RecurrenceBase {
  type: 'weekly';
  weekDay: number; // 0-6 (Sunday-Saturday)
}

export interface MonthlyRecurrence extends RecurrenceBase {
  type: 'monthly';
  monthDay: number; // 1-31
}

export interface YearlyRecurrence extends RecurrenceBase {
  type: 'yearly';
  monthDate: { month: number; day: number }; // For yearly
}

export type TaskRecurrence = WeeklyRecurrence | MonthlyRecurrence | YearlyRecurrence;

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}
