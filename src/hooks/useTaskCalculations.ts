
import { Task } from '@/types/task';

export const useTaskCalculations = (tasks: Task[]) => {
  const getPendingTasksCount = () => {
    return tasks.filter(t => !t.recurrence && t.status !== 'closed').length;
  };

  const getTasksCountByDate = (filter: 'today' | 'next5days' | 'next30days') => {
    const pendingTasks = tasks.filter(t => !t.recurrence && t.status !== 'closed');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getFutureDate = (days: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + days);
      return date;
    };

    switch (filter) {
      case 'today':
        return pendingTasks.filter(task => new Date(task.dueDate).toDateString() === today.toDateString()).length;
      case 'next5days':
        const fiveDaysFromNow = getFutureDate(4);
        return pendingTasks.filter(task => {
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate >= today && taskDueDate <= fiveDaysFromNow;
        }).length;
      case 'next30days':
        const thirtyDaysFromNow = getFutureDate(29);
        return pendingTasks.filter(task => {
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate >= today && taskDueDate <= thirtyDaysFromNow;
        }).length;
      default:
        return 0;
    }
  };
  
  return {
    getPendingTasksCount,
    getTasksCountByDate,
  };
};

