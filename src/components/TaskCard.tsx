import React, { useState } from 'react';
import { Calendar, Clock, User, CheckCircle, PlayCircle, FileText, ChevronDown, ChevronRight, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task, TaskStatus } from '@/types/task';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskCardProps {
  task: Task;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onUpdate, onEdit }) => {
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
    const dateStr = format(date, 'MMM dd');
    
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

  const isEditable = () => {
    if (task.status !== 'closed') {
      return true;
    }
    // A task is editable for 24 hours after completion.
    if (!task.updatedAt) return false;
    const completedAt = new Date(task.updatedAt);
    const now = new Date();
    const hoursSinceCompletion = (now.getTime() - completedAt.getTime()) / (1000 * 60 * 60);
    return hoursSinceCompletion <= 24;
  };

  const editable = isEditable();

  return (
    <div className={`list-item ${isExpanded ? 'list-item-expanded' : ''} ${isOverdue() && task.status !== 'closed' ? 'border-l-4 border-l-destructive' : ''}`}>
      {/* Main List Item Row */}
      <div 
        className="flex items-center justify-between p-4"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          {/* Expand/Collapse Icon */}
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0 text-accent hover:bg-accent/10" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </Button>

          {/* Task Content */}
          <div className="flex-1 min-w-0" onClick={() => setIsExpanded(!isExpanded)} style={{cursor: 'pointer'}}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-primary text-sm truncate pr-2 task-subject">{task.subject}</h3>
              <Badge className={`${getStatusColor(task.status)} flex items-center gap-1 px-2 py-0.5 text-xs shrink-0`}>
                {getStatusIcon(task.status)}
                {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            </div>
            
            <div className="flex items-center text-xs text-muted-foreground space-x-4">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">{task.assignee}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span className={`${isOverdue() ? 'text-destructive' : ''}`}>
                  {formatDateTime()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 ml-2 shrink-0">
           <Tooltip>
            <TooltipTrigger asChild>
              <div tabIndex={0}>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-accent hover:bg-accent/10"
                  onClick={() => onEdit(task)}
                  disabled={!editable}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </TooltipTrigger>
            {!editable && (
              <TooltipContent>
                <p>Completed tasks can only be edited up to 24 hours after completion.</p>
              </TooltipContent>
            )}
          </Tooltip>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleStatusChange();
            }}
            size="sm"
            variant={task.status === 'closed' ? 'secondary' : 'default'}
            className="text-xs px-3 py-1 bg-accent hover:bg-accent/90 text-accent-foreground"
            disabled={task.status === 'closed'}
          >
            {task.status === 'assigned' && 'Start'}
            {task.status === 'in-progress' && 'Complete'}
            {task.status === 'closed' && 'Done'}
          </Button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-border/20 animate-expand">
          <div className="pt-3 space-y-3">
            {/* Task Details */}
            <div>
              <p className="text-sm text-foreground leading-relaxed">{task.details}</p>
            </div>

            {/* Labels */}
            {task.labels.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {task.labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="text-xs px-2 py-1 bg-secondary/20 text-secondary border border-secondary/30">
                    {label}
                  </Badge>
                ))}
              </div>
            )}

            {/* Additional Info */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock className="w-3 h-3" />
                <span>Reminder: {task.reminderTime}</span>
              </div>
              
              {task.url && (
                <div className="flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  <a 
                    href={task.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-accent hover:text-accent/80 underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Link
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
