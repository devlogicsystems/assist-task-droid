
import { useEffect } from 'react';
import { addDays, addMonths, set, isBefore, format, addYears, isAfter, isSameDay } from 'date-fns';
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
    const recurringTemplates = tasks.filter(t => t.recurrence && t.templateStatus !== 'inactive');
    if (!recurringTemplates.length) return;

    console.log('Processing recurring templates:', recurringTemplates.length);

    let newTasks: Task[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetEndDate = addDays(today, 30); // Generate tasks for next 30 days

    recurringTemplates.forEach(template => {
      const existingInstances = tasks
        .filter(t => t.recurrenceTemplateId === template.id)
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      
      console.log(`Template "${template.subject}" has ${existingInstances.length} existing instances`);
      
      let lastDueDate = existingInstances.length > 0 
        ? new Date(existingInstances[0].dueDate)
        : addDays(new Date(template.dueDate || new Date()), -1);

      let nextDueDate: Date | null = lastDueDate;
      let generatedCount = 0;
      
      for (let i = 0; i < 100 && generatedCount < 10; i++) { // Safety loop and limit generations
        if (!template.recurrence) continue;
        
        nextDueDate = getNextOccurrence(template.recurrence, nextDueDate);
        
        if (!nextDueDate || isAfter(nextDueDate, targetEndDate)) {
          break;
        }

        // Check if an instance already exists for this date
        const instanceExists = tasks.some(t =>
          t.recurrenceTemplateId === template.id &&
          isSameDay(new Date(t.dueDate), nextDueDate)
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
          delete newTask.templateStatus;
          newTasks.push(newTask);
          generatedCount++;
          console.log(`Generated recurring task: ${newTask.subject} for ${newTask.dueDate}`);
        }
      }
    });

    if (newTasks.length > 0) {
      console.log(`Adding ${newTasks.length} new recurring task instances`);
      setTasks(prev => [...prev, ...newTasks]);
      toast({
        title: "Recurring Tasks Generated",
        description: `${newTasks.length} upcoming recurring tasks have been added.`,
      });
    }
  }, [tasks, setTasks, toast]);
};
