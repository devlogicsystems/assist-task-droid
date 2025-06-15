
import { useEffect } from 'react';
import { addDays, addMonths, set, isBefore, format, addYears, isAfter } from 'date-fns';
import { Task, TaskRecurrence } from '@/types/task';
import { useToast } from "@/hooks/use-toast";

const getNextOccurrence = (recurrence: TaskRecurrence, after: Date): Date | null => {
  const candidates: Date[] = [];
  
  switch (recurrence.type) {
    case 'weekly':
      if (!recurrence.weekDays || recurrence.weekDays.length === 0) return null;
      recurrence.weekDays.forEach(weekDay => {
        let candidate = new Date(after);
        // Start check from day after 'after' date
        candidate = addDays(candidate, 1);
        while (candidate.getDay() !== weekDay) {
          candidate = addDays(candidate, 1);
        }
        candidates.push(candidate);
      });
      break;

    case 'monthly':
      if (!recurrence.monthDays || recurrence.monthDays.length === 0) return null;
      recurrence.monthDays.forEach(monthDay => {
        // Check current month
        let candidateCurrentMonth = set(after, { date: monthDay });
        if (candidateCurrentMonth.getDate() === monthDay && isAfter(candidateCurrentMonth, after)) {
          candidates.push(candidateCurrentMonth);
        }
        
        // Check next month
        let candidateNextMonth = set(addMonths(after, 1), { date: monthDay });
        if (candidateNextMonth.getDate() === monthDay) {
          candidates.push(candidateNextMonth);
        }
      });
      break;
      
    case 'yearly':
      if (!recurrence.yearDates || recurrence.yearDates.length === 0) return null;
      recurrence.yearDates.forEach(date => {
        let candidate = new Date(after.getFullYear(), date.month, date.day);
        if (isBefore(candidate, after) || candidate.getTime() === after.getTime()) {
          candidate = addYears(candidate, 1);
        }
        candidates.push(candidate);
      });
      break;
      
    default:
      return null;
  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => a.getTime() - b.getTime());
  return candidates[0];
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
    const targetDueDate = addDays(today, 5);

    recurringTemplates.forEach(template => {
      const existingInstances = tasks
        .filter(t => t.recurrenceTemplateId === template.id)
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      
      let lastDueDate = existingInstances.length > 0 
        ? new Date(existingInstances[0].dueDate)
        : addDays(new Date(template.dueDate || new Date()), -1);

      let nextDueDate: Date | null = lastDueDate;
      for (let i = 0; i < 52; i++) { // Safety loop to prevent infinite execution
        if (!template.recurrence) continue;
        
        nextDueDate = getNextOccurrence(template.recurrence, nextDueDate);
        
        if (!nextDueDate || isAfter(nextDueDate, targetDueDate)) {
          break;
        }

        if (nextDueDate.toDateString() === targetDueDate.toDateString()) {
          const instanceExists = tasks.some(t =>
            t.recurrenceTemplateId === template.id &&
            new Date(t.dueDate).toDateString() === nextDueDate?.toDateString()
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
