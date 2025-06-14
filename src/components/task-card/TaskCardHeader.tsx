
import React from 'react';
import { Calendar, User, ChevronDown, ChevronRight, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TaskCardHeaderProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onStatusChange: () => void;
  isOverdue: boolean;
  isEditable: boolean;
  statusColor: string;
  statusIcon: React.ReactNode;
  formattedDateTime: string;
}

const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  task,
  isExpanded,
  onToggleExpand,
  onEdit,
  onStatusChange,
  isOverdue,
  isEditable,
  statusColor,
  statusIcon,
  formattedDateTime,
}) => {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center space-x-3 flex-1 min-w-0">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0 text-accent hover:bg-accent/10" onClick={onToggleExpand}>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>

        <div className="flex-1 min-w-0" onClick={onToggleExpand} style={{ cursor: 'pointer' }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-primary text-sm truncate pr-2 task-subject">{task.subject}</h3>
            <Badge className={`${statusColor} flex items-center gap-1 px-2 py-0.5 text-xs shrink-0`}>
              {statusIcon}
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
              <span className={`${isOverdue ? 'text-destructive' : ''}`}>
                {formattedDateTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-2 shrink-0">
         <Tooltip>
          <TooltipTrigger asChild>
            <div tabIndex={0}>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-accent hover:bg-accent/10"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                disabled={!isEditable}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </TooltipTrigger>
          {!isEditable && (
            <TooltipContent>
              <p>Completed tasks can only be edited up to 24 hours after completion.</p>
            </TooltipContent>
          )}
        </Tooltip>

        <Button
          onClick={(e) => {
            e.stopPropagation();
            onStatusChange();
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
  );
};

export default TaskCardHeader;
