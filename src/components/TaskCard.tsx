
import React, { useState } from 'react';
import { Calendar, Clock, User, Edit, CheckCircle, PlayCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Task, TaskStatus } from '@/types/task';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate }) => {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleStatusChange = () => {
    const nextStatus = getNextStatus(task.status);
    onUpdate({ ...task, status: nextStatus });
  };

  const formatDateTime = () => {
    const date = new Date(task.dueDate);
    const dateStr = format(date, 'MMM dd, yyyy');
    
    if (task.isFullDay) {
      return `${dateStr} (Full Day)`;
    }
    
    return `${dateStr} at ${task.dueTime}`;
  };

  const isOverdue = () => {
    if (task.status === 'closed') return false;
    
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    
    if (!task.isFullDay && task.dueTime) {
      const [hours, minutes] = task.dueTime.split(':');
      dueDate.setHours(parseInt(hours), parseInt(minutes));
    }
    
    return dueDate < today;
  };

  return (
    <Card className={`task-card ${isOverdue() ? 'border-red-200 bg-red-50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-medium text-foreground mb-1">{task.subject}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{task.details}</p>
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            variant="ghost"
            size="sm"
            className="ml-2"
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>

        {/* Labels */}
        {task.labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {task.labels.map((label, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        )}

        {/* Task Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4" />
            <span>{task.assignee}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className={isOverdue() ? 'text-red-600 font-medium' : ''}>
              {formatDateTime()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>Reminder: {task.reminderTime}</span>
          </div>

          {task.url && (
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                View Link
              </a>
            </div>
          )}
        </div>

        {/* Status and Actions */}
        <div className="flex items-center justify-between mt-4">
          <Badge className={`${getStatusColor(task.status)} flex items-center gap-1`}>
            {getStatusIcon(task.status)}
            {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          
          <Button
            onClick={handleStatusChange}
            size="sm"
            variant="outline"
            disabled={task.status === 'closed'}
          >
            {task.status === 'assigned' && 'Start Task'}
            {task.status === 'in-progress' && 'Complete Task'}
            {task.status === 'closed' && 'Completed'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
