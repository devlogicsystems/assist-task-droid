
import { useEffect } from 'react';
import { addDays, addMonths, set, isBefore, format, addYears } from 'date-fns';
import { Task, TaskRecurrence } from '@/types/task';
import { useToast } from "@/hooks/use-toast";

const getNextOccurrence = (recurrence: TaskRecurrence, after: Date): Date => {
  let candidate = new Date(after);
  switch (recurrence.type) {
    case 'weekly':
      candidate = addDays(candidate, 1);
      while (candidate.getDay() !== recurrence.weekDay) {
        candidate = addDays(candidate, 1);
      }
      return candidate;
    case 'monthly': {
      candidate = addDays(candidate, 1);
      const monthDay = recurrence.monthDay;
      if (candidate.getDate() > monthDay) {
        candidate = addMonths(candidate, 1);
      }
      let tempCandidate = set(candidate, { date: monthDay });
      // Handle cases for months with fewer days
      while (tempCandidate.getMonth() > candidate.getMonth()) {
        candidate = addMonths(candidate, 1);
        tempCandidate = set(candidate, { date: monthDay });
      }
      return tempCandidate;
    }
    case 'yearly': {
      let year = after.getFullYear();
      const month = recurrence.monthDate.month;
      const day = recurrence.monthDate.day;
      candidate = new Date(year, month, day);
      if (isBefore(candidate, after) || candidate.getTime() === after.getTime()) {
        candidate = new Date(year + 1, month, day);
      }
      return candidate;
    }
    default:
      throw new Error('Unknown recurrence type');
  }
};

export const useRecurringTasks = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const { toast } = useToast();

  useEffect(() => {
    const recurringTemplates = tasks.filter(t => t.recurrence);
    if (!recurringTemplates.length) return;

    let newTasks: Task[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkEndDate = addDays(today, 5);

    recurringTemplates.forEach(template => {
      const existingInstances = tasks
        .filter(t => t.recurrenceTemplateId === template.id)
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      
      let lastDueDate = existingInstances.length > 0 
        ? new Date(existingInstances[0].dueDate)
        : addDays(new Date(template.dueDate), -1);

      let nextDueDate = lastDueDate;
      for (let i = 0; i < 52; i++) {
        if (!template.recurrence) continue;
        nextDueDate = getNextOccurrence(template.recurrence, nextDueDate);
        
        if (isBefore(checkEndDate, nextDueDate)) {
          break;
        }

        const instanceExists = tasks.some(t =>
          t.recurrenceTemplateId === template.id &&
          new Date(t.dueDate).toDateString() === nextDueDate.toDateString()
        );

        if (!instanceExists) {
          const newTask: Task = {
            ...template,
            id: `${template.id}-recur-${nextDueDate.getTime()}`,
            dueDate: format(nextDueDate, 'yyyy-MM-dd'),
            status: 'assigned',
            recurrenceTemplateId: template.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          delete newTask.recurrence;
          newTasks.push(newTask);
        }
      }
    });

    if (newTasks.length > 0) {
      setTasks(prev => [...prev, ...newTasks]);
      toast({
        title: "Recurring Tasks Generated",
        description: `${newTasks.length} upcoming tasks have been added.`,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
