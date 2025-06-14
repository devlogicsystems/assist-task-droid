
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
      recurrence = { type: 'weekly', weekDay: r.weekDay, interval: 1 };
    } else if (r.type === 'monthly') {
      recurrence = { type: 'monthly', monthDay: r.monthDay, interval: 1 };
    } else if (r.type === 'yearly' && r.monthDate && r.monthDate.month != null && r.monthDate.day != null) {
      recurrence = { type: 'yearly', monthDate: { month: r.monthDate.month, day: r.monthDate.day }, interval: 1 };
    }
  }

  const { recurrence: _formRecurrence, ...restData } = data;

  if (existingTask) {
    return {
      ...existingTask,
      ...restData,
      recurrence,
      updatedAt: new Date().toISOString(),
    };
  }

  return {
    id: Date.now().toString(),
    status: 'assigned',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...restData,
    url: data.url || undefined,
    recurrence,
  };
}
