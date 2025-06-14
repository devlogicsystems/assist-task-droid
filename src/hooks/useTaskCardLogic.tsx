
import { Task, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { User, PlayCircle, CheckCircle } from 'lucide-react';

export const useTaskCardLogic = (task: Task) => {
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'assigned':
        return 'status-assigned';
      case 'in-progress':
        return 'status-in-progress';
      case 'closed':
        return 'status-closed';
      default:
        return 'status-assigned';
    }
  };

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'assigned':
        return <User className="w-3 h-3" />;
      case 'in-progress':
        return <PlayCircle className="w-3 h-3" />;
      case 'closed':
        return <CheckCircle className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
    switch (currentStatus) {
      case 'assigned':
        return 'in-progress';
      case 'in-progress':
        return 'closed';
      case 'closed':
        return 'assigned';
      default:
        return 'assigned';
    }
  };

  const formatDateTime = () => {
    if (!task.dueDate) {
      return 'No due date';
    }
    const date = new Date(`${task.dueDate}T00:00:00`);

    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }

    const dateStr = format(date, 'MMM dd');
    
    if (task.isFullDay) {
      return `${dateStr} (Full Day)`;
    }
    
    return `${dateStr} at ${task.dueTime}`;
  };

  const isOverdue = () => {
    if (task.status === 'closed' || !task.dueDate) return false;
    
    const today = new Date();
    const dueDate = new Date(`${task.dueDate}T00:00:00`);
    
    if (isNaN(dueDate.getTime())) {
      return false;
    }
    
    if (!task.isFullDay && task.dueTime) {
      const timeParts = task.dueTime.split(':');
      if (timeParts.length === 2) {
        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        if (!isNaN(hours) && !isNaN(minutes)) {
          dueDate.setHours(hours, minutes);
        }
      }
    }
    
    return dueDate < today;
  };

  const isEditable = () => {
    if (task.status !== 'closed') {
      return true;
    }
    if (!task.updatedAt) return false;
    const completedAt = new Date(task.updatedAt);
    const now = new Date();
    const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion <= 24;
  };

  return {
    getStatusColor,
    getStatusIcon,
    getNextStatus,
    formatDateTime,
    isOverdue: isOverdue(),
    isEditable: isEditable(),
  };
};
