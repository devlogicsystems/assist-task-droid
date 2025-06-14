import { useState, useEffect, useMemo } from 'react';
import { addDays, addMonths, addYears, set, isBefore, format } from 'date-fns';
import { Task, TaskStatus, TaskRecurrence } from '@/types/task';
import { useToast } from "@/hooks/use-toast";
import { TaskFormData } from '@/lib/validations/task';

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

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
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
        nextDueDate = getNextOccurrence(template.recurrence!, nextDueDate);
        
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
    let recurrence: TaskRecurrence | undefined = undefined;
    if (newTaskData.recurrence) {
      const r = newTaskData.recurrence;
      if (r.type === 'weekly') {
        recurrence = { type: 'weekly', weekDay: r.weekDay, interval: 1 };
      } else if (r.type === 'monthly') {
        recurrence = { type: 'monthly', monthDay: r.monthDay, interval: 1 };
      } else if (r.type === 'yearly' && r.monthDate && r.monthDate.month != null && r.monthDate.day != null) {
        recurrence = { type: 'yearly', monthDate: { month: r.monthDate.month, day: r.monthDate.day }, interval: 1 };
      }
    }

    const task: Task = {
      id: Date.now().toString(),
      status: 'assigned',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subject: newTaskData.subject,
      assignee: newTaskData.assignee,
      dueDate: newTaskData.dueDate,
      isFullDay: newTaskData.isFullDay,
      labels: newTaskData.labels,
      details: newTaskData.details,
      dueTime: newTaskData.dueTime,
      reminderTime: newTaskData.reminderTime,
      url: newTaskData.url || undefined,
      recurrence: recurrence,
    };
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
    getTasksByStatus,
  };
};
