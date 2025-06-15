import { useState, useEffect, useMemo } from 'react';
import { Task, TaskStatus } from '@/types/task';
import { useToast } from "@/hooks/use-toast";
import { TaskFormData } from '@/lib/validations/task';
import { useRecurringTasks } from './useRecurringTasks';
import { mapTaskFormDataToTask } from '@/lib/taskUtils';

const sampleTasks: Task[] = [
  {
    id: '1',
    subject: 'Review Project Proposal',
    details: 'Review and provide feedback on the Q4 marketing proposal. Ensure all financial projections are accurate and marketing strategies align with company goals for the next quarter. Double check the competitive analysis section.',
    assignee: 'John Doe',
    dueDate: '2024-06-12', // Note: This date is in the past
    dueTime: '14:30',
    reminderTime: '14:20',
    status: 'assigned',
    labels: ['High Priority', 'Marketing', 'Q4 Planning'],
    isFullDay: false,
    url: 'https://example.com/proposal.pdf'
  },
  {
    id: '2',
    subject: 'Team Meeting Preparation',
    details: 'Prepare agenda and materials for weekly team sync. Topics to include: project updates, KPI review, and upcoming sprint planning. Collect input from all team members for agenda items.',
    assignee: 'Jane Smith',
    dueDate: '2024-06-13', // Note: This date is in the past
    dueTime: '10:00',
    reminderTime: '09:50',
    status: 'in-progress',
    labels: ['Meeting', 'Team Sync', 'Operations'],
    isFullDay: false
  },
  {
    id: '3',
    subject: 'Client Presentation Design',
    details: 'Design slides for the new product feature presentation to client X. Focus on clear visuals and concise messaging. Incorporate latest branding guidelines.',
    assignee: 'Mike Johnson',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Due in 2 days
    isFullDay: true,
    reminderTime: '09:00',
    status: 'assigned',
    labels: ['Client Facing', 'Presentation', 'Design', 'Product Launch'],
    url: 'https://meet.google.com/abc-def-ghi'
  },
  {
    id: '4',
    subject: 'Develop New API Endpoint',
    details: 'Develop and test the new /users/preferences API endpoint. Ensure proper authentication and validation. Write unit and integration tests.',
    assignee: 'Alice Brown',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Due in 7 days
    dueTime: '17:00',
    reminderTime: '16:30',
    status: 'assigned',
    labels: ['Development', 'API', 'Backend'],
    isFullDay: false
  }
];

const TASKS_STORAGE_KEY = 'taskflow_tasks';

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      return storedTasks ? JSON.parse(storedTasks) : sampleTasks;
    } catch (error) {
      console.error("Failed to parse tasks from localStorage:", error);
      return sampleTasks;
    }
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const { toast } = useToast();

  useRecurringTasks(tasks, setTasks);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

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

  const handleCreateTask = (newTaskData: TaskFormData) => {
    const task = mapTaskFormDataToTask(newTaskData);
    if (task.recurrence) {
      task.templateStatus = 'active';
    }
    setTasks(prev => [task, ...prev]);
    toast({
      title: "Task Created",
      description: `"${task.subject}" has been added.`,
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    const finalTask = { ...updatedTask, updatedAt: new Date().toISOString() };

    setTasks(prev => prev.map(task => (task.id === finalTask.id ? finalTask : task)));
    toast({
      title: "Task Updated",
      description: `"${finalTask.subject}" has been updated.`,
    });
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(task => {
        // remove the template itself or any instances of it
        return task.id !== taskId && task.recurrenceTemplateId !== taskId;
    }));
    toast({
      title: "Task Template Deleted",
      description: `"${taskToDelete.subject}" and its instances have been removed.`,
    });
  };

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status).length;
  
  return {
    tasks,
    setTasks,
    searchQuery,
    setSearchQuery,
    selectedDateFilter,
    setSelectedDateFilter,
    statusFilter,
    setStatusFilter,
    filteredTasks,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    getTasksByStatus,
  };
};
