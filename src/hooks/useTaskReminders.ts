
import { useState, useEffect, useRef } from 'react';
import { Task } from '@/types/task';
import { useToast } from '@/hooks/use-toast';

interface ReminderState {
  activeReminders: Map<string, NodeJS.Timeout>;
  snoozeData: Map<string, { originalTime: string; snoozeUntil: Date }>;
}

export const useTaskReminders = (tasks: Task[], onTaskUpdate: (task: Task) => void) => {
  const [reminderState, setReminderState] = useState<ReminderState>({
    activeReminders: new Map(),
    snoozeData: new Map()
  });
  const [activeReminderTask, setActiveReminderTask] = useState<Task | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Initialize audio
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmomBjuV3fLOditRDyh+zPLZiTQIGGS57uGaRgwRUKXh7rJmDBo8k9b0wncrBSF1w+/ejTwNF1qu5+yjUgwOgFTP8tdgNAkfbrvq5ZxODBNRpuHx');
    
    return () => {
      // Cleanup all active reminders
      reminderState.activeReminders.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  useEffect(() => {
    const now = new Date();
    const newActiveReminders = new Map();

    tasks.forEach(task => {
      if (task.status === 'closed' || !task.reminderTime || !task.dueDate) return;
      
      const reminderDateTime = new Date(`${task.dueDate}T${task.reminderTime}`);
      const timeDiff = reminderDateTime.getTime() - now.getTime();
      
      // Check if task is snoozed
      const snoozeInfo = reminderState.snoozeData.get(task.id);
      if (snoozeInfo && now < snoozeInfo.snoozeUntil) return;
      
      if (timeDiff > 0 && timeDiff <= 24 * 60 * 60 * 1000) { // Within 24 hours
        const timeout = setTimeout(() => {
          showReminder(task);
        }, timeDiff);
        
        newActiveReminders.set(task.id, timeout);
      }
    });

    // Clear old reminders
    reminderState.activeReminders.forEach((timeout, taskId) => {
      if (!newActiveReminders.has(taskId)) {
        clearTimeout(timeout);
      }
    });

    setReminderState(prev => ({ ...prev, activeReminders: newActiveReminders }));
  }, [tasks, reminderState.snoozeData]);

  const showReminder = (task: Task) => {
    setActiveReminderTask(task);
    playReminderSound();
    
    toast({
      title: "Task Reminder",
      description: `"${task.subject}" is due now!`,
      duration: 10000,
    });
  };

  const playReminderSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  };

  const handleSnooze = (minutes: number) => {
    if (!activeReminderTask) return;
    
    const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
    setReminderState(prev => ({
      ...prev,
      snoozeData: new Map(prev.snoozeData).set(activeReminderTask.id, {
        originalTime: activeReminderTask.reminderTime!,
        snoozeUntil
      })
    }));
    
    setActiveReminderTask(null);
    toast({
      title: "Task Snoozed",
      description: `Reminder snoozed for ${minutes} minutes.`,
    });
  };

  const handleActionTaken = () => {
    if (!activeReminderTask) return;
    
    const nextStatus = activeReminderTask.status === 'assigned' ? 'in-progress' : 'closed';
    onTaskUpdate({ ...activeReminderTask, status: nextStatus });
    setActiveReminderTask(null);
  };

  return {
    activeReminderTask,
    setActiveReminderTask,
    handleSnooze,
    handleActionTaken
  };
};
