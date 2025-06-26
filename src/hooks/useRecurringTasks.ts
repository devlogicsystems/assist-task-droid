
import { useEffect } from 'react';
import { addDays, addMonths, set, isBefore, format, addYears, isAfter, isSameDay } from 'date-fns';
import { Task, TaskRecurrence } from '@/types/task';
import { useToast } from "@/hooks/use-toast";

const getNextOccurrence = (recurrence: TaskRecurrence, after: Date): Date | null => {
  const candidates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Safety check: don't generate dates more than 1 year in the future
  const maxFutureDate = addYears(today, 1);
  
  switch (recurrence.type) {
    case 'weekly':
      if (!recurrence.weekDays || recurrence.weekDays.length === 0) return null;
      recurrence.weekDays.forEach(weekDay => {
        let candidate = new Date(after);
        candidate = addDays(candidate, 1); // Start from next day
        
        // Find the next occurrence of this weekday
        let attempts = 0;
        while (candidate.getDay() !== weekDay && attempts < 7) {
          candidate = addDays(candidate, 1);
          attempts++;
        }
        
        if (attempts < 7 && !isAfter(candidate, maxFutureDate)) {
          candidates.push(candidate);
        }
      });
      break;

    case 'monthly':
      if (!recurrence.monthDays || recurrence.monthDays.length === 0) return null;
      recurrence.monthDays.forEach(monthDay => {
        let candidate = new Date(after);
        
        // Try current month first
        let targetDate = set(candidate, { date: monthDay });
        
        // If the target date is not after 'after', try next month
        if (!isAfter(targetDate, after)) {
          targetDate = set(addMonths(candidate, 1), { date: monthDay });
        }
        
        // Ensure the date is valid and not too far in the future
        if (targetDate.getDate() === monthDay && !isAfter(targetDate, maxFutureDate)) {
          candidates.push(targetDate);
        }
      });
      break;
      
    case 'yearly':
      if (!recurrence.yearDates || recurrence.yearDates.length === 0) return null;
      recurrence.yearDates.forEach(date => {
        let candidate = new Date(after.getFullYear(), date.month, date.day);
        
        // If this year's date has passed, move to next year
        if (!isAfter(candidate, after)) {
          candidate = addYears(candidate, 1);
        }
        
        if (!isAfter(candidate, maxFutureDate)) {
          candidates.push(candidate);
        }
      });
      break;
      
    default:
      return null;
  }

  if (candidates.length === 0) {
    return null;
  }

  // Sort and return the earliest occurrence
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

    recurringTemplates.forEach(template => {
      // Safety check: if template has too many instances, skip it
      const existingInstances = tasks
        .filter(t => t.recurrenceTemplateId === template.id)
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      
      console.log(`Template "${template.subject}" has ${existingInstances.length} existing instances`);
      
      // If we already have more than 50 instances, something is wrong - skip this template
      if (existingInstances.length > 50) {
        console.warn(`Template "${template.subject}" has too many instances (${existingInstances.length}), skipping to prevent overflow`);
        return;
      }
      
      // Find the latest existing instance date or use today
      let lastGeneratedDate = today;
      if (existingInstances.length > 0) {
        const latestInstanceDate = new Date(existingInstances[0].dueDate);
        lastGeneratedDate = isAfter(latestInstanceDate, today) ? latestInstanceDate : today;
      }

      // Get the next occurrence after the last generated date
      let nextDueDate = getNextOccurrence(template.recurrence!, lastGeneratedDate);
      
      if (!nextDueDate) {
        console.log(`No next occurrence found for template "${template.subject}"`);
        return;
      }

      // Only generate up to 5 days ahead from today, not from next occurrence
      const targetEndDate = addDays(today, 5);
      console.log(`Template "${template.subject}": Next occurrence ${format(nextDueDate, 'yyyy-MM-dd')}, generating until ${format(targetEndDate, 'yyyy-MM-dd')}`);

      // Only generate if the next occurrence is within our 5-day window
      if (isAfter(nextDueDate, targetEndDate)) {
        console.log(`Next occurrence for "${template.subject}" is beyond 5-day window, skipping`);
        return;
      }

      let currentDate = nextDueDate;
      let generatedCount = 0;
      const maxGenerations = 3; // Very conservative limit
      
      // Generate instances up to 5 days from today
      while (currentDate && !isAfter(currentDate, targetEndDate) && generatedCount < maxGenerations) {
        // Check if an instance already exists for this date
        const instanceExists = tasks.some(t =>
          t.recurrenceTemplateId === template.id &&
          isSameDay(new Date(t.dueDate), currentDate)
        );

        if (!instanceExists) {
          const newTask: Task = {
            ...template,
            id: `${template.id}-recur-${currentDate.getTime()}`,
            dueDate: format(currentDate, 'yyyy-MM-dd'),
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

        // Get the next occurrence after the current date
        const nextOccurrence = getNextOccurrence(template.recurrence!, currentDate);
        
        // Break if we can't find a next occurrence or if it's beyond our window
        if (!nextOccurrence || isAfter(nextOccurrence, targetEndDate)) {
          console.log(`Breaking loop for template "${template.subject}" - no more occurrences in window`);
          break;
        }
        
        currentDate = nextOccurrence;
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
