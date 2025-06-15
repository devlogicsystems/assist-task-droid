
import { useMemo } from 'react';
import { Task, TaskStatus } from '@/types/task';

export const useFilteredTasks = (
  tasks: Task[], 
  searchQuery: string, 
  selectedDateFilter: 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days',
  statusFilter: TaskStatus | 'all'
) => {
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task => !task.recurrence);

    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    } else {
      filtered = filtered.filter(task => task.status !== 'closed');
    }

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.subject.toLowerCase().includes(lowercasedQuery) ||
        task.assignee.toLowerCase().includes(lowercasedQuery) ||
        (task.details && task.details.toLowerCase().includes(lowercasedQuery)) ||
        task.labels.some(label => label.toLowerCase().includes(lowercasedQuery))
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getFutureDate = (days: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + days);
      return date;
    };
    
    if (statusFilter !== 'closed') {
        switch (selectedDateFilter) {
          case 'today':
            return filtered.filter(task => new Date(task.dueDate).toDateString() === today.toDateString());
          case 'tomorrow':
            const tomorrow = getFutureDate(1);
            return filtered.filter(task => new Date(task.dueDate).toDateString() === tomorrow.toDateString());
          case 'next5days':
            const fiveDaysFromNow = getFutureDate(4);
            return filtered.filter(task => {
              const taskDueDate = new Date(task.dueDate);
              return taskDueDate >= today && taskDueDate <= fiveDaysFromNow;
            });
          case 'next30days':
            const thirtyDaysFromNow = getFutureDate(29);
            return filtered.filter(task => {
              const taskDueDate = new Date(task.dueDate);
              return taskDueDate >= today && taskDueDate <= thirtyDaysFromNow;
            });
          case 'all':
          default:
            return filtered;
        }
    }

    return filtered;
  }, [tasks, searchQuery, selectedDateFilter, statusFilter]);
  
  return filteredTasks;
};

