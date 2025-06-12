
import React, { useState } from 'react';
import { Calendar, Clock, User, Edit, CheckCircle, PlayCircle, FileText, MoreHorizontal } from 'lucide-react';
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
    <Card className={`task-card ${isOverdue() ? 'border-destructive/30 bg-red-50/50' : ''} hover:scale-[1.02] transition-transform`}>
      <CardContent className="p-0">
        {/* Card Header */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground mb-2 leading-tight">{task.subject}</h3>
              <p className="text-muted-foreground line-clamp-2 leading-relaxed">{task.details}</p>
            </div>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="ml-3 h-8 w-8 p-0 hover:bg-gray-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>

          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {task.labels.map((label, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="px-5 pb-4 space-y-3">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium">{task.assignee}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <span className={`font-medium ${isOverdue() ? 'text-destructive' : 'text-foreground'}`}>
                {formatDateTime()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Reminder: {task.reminderTime}</span>
            </div>
          </div>

          {task.url && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                  View Link
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="px-5 py-4 bg-gray-50/50 border-t border-border/50 flex items-center justify-between">
          <Badge className={`${getStatusColor(task.status)} flex items-center gap-1.5 px-3 py-1.5 font-medium`}>
            {getStatusIcon(task.status)}
            {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
          
          <Button
            onClick={handleStatusChange}
            size="sm"
            variant={task.status === 'closed' ? 'secondary' : 'default'}
            disabled={task.status === 'closed'}
            className="font-medium"
          >
            {task.status === 'assigned' && 'Start Task'}
            {task.status === 'in-progress' && 'Complete'}
            {task.status === 'closed' && 'Completed'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskCard;
