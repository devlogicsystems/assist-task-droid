
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
        candidate = addDays(candidate, 1); // Start from next day
        
        // Find the next occurrence of this weekday
        while (candidate.getDay() !== weekDay) {
          candidate = addDays(candidate, 1);
        }
        candidates.push(candidate);
      });
      break;

    case 'monthly':
      if (!recurrence.monthDays || recurrence.monthDays.length === 0) return null;
      recurrence.monthDays.forEach(monthDay => {
        let candidate = new Date(after);
        candidate = addDays(candidate, 1); // Start from next day
        
        // Set to the target day of current month
        let targetDate = set(candidate, { date: monthDay });
        
        // If the target date is before or equal to 'after', move to next month
        if (!isAfter(targetDate, after)) {
          targetDate = set(addMonths(candidate, 1), { date: monthDay });
        }
        
        // Ensure the date is valid (handles cases like Feb 31st)
        if (targetDate.getDate() === monthDay) {
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
        candidates.push(candidate);
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
      const existingInstances = tasks
        .filter(t => t.recurrenceTemplateId === template.id)
        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      
      console.log(`Template "${template.subject}" has ${existingInstances.length} existing instances`);
      
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

      // Calculate target end date: 5 days after the next occurrence
      const targetEndDate = addDays(nextDueDate, 5);
      console.log(`Template "${template.subject}": Next occurrence ${format(nextDueDate, 'yyyy-MM-dd')}, generating until ${format(targetEndDate, 'yyyy-MM-dd')}`);

      let currentDate = nextDueDate;
      let generatedCount = 0;
      const maxGenerations = 5; // Reduced safety limit since we only need 5 days ahead
      
      // Generate instances up to 5 days after the next occurrence
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
        
        // Break if we can't find a next occurrence or if it's the same as current (infinite loop protection)
        if (!nextOccurrence || isSameDay(nextOccurrence, currentDate) || !isAfter(nextOccurrence, currentDate)) {
          console.log(`Breaking loop for template "${template.subject}" - no more valid occurrences or same date detected`);
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
