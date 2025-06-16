
import { Task, TaskRecurrence } from '@/types/task';
import { TaskFormData } from '@/lib/validations/task';

export function mapTaskFormDataToTask(
  data: TaskFormData,
  existingTask?: Task
): Task {
  let recurrence: TaskRecurrence | undefined = undefined;
  if (data.recurrence) {
    const r = data.recurrence;
    if (r.type === 'weekly') {
      recurrence = { type: 'weekly', weekDays: r.weekDays, interval: 1 };
    } else if (r.type === 'monthly') {
      recurrence = { type: 'monthly', monthDays: r.monthDays, interval: 1 };
    } else if (r.type === 'yearly') {
      // Explicitly map to ensure type correctness
      const yearDates = r.yearDates.map(d => ({ month: d.month, day: d.day }));
      recurrence = { type: 'yearly', yearDates: yearDates, interval: 1 };
    }
  }

  const taskData = {
    subject: data.subject,
    details: data.details,
    assignee: data.assignee || 'Self',
    dueDate: data.dueDate,
    dueTime: data.dueTime,
    reminderTime: data.reminderTime,
    isFullDay: data.isFullDay,
    labels: data.labels && data.labels.length > 0 ? data.labels : ['General'],
    url: data.url || undefined,
    recurrence,
  };

  if (existingTask) {
    return {
      ...existingTask,
      ...taskData,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    ...taskData,
    id: Date.now().toString(),
    status: 'in-progress',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}
