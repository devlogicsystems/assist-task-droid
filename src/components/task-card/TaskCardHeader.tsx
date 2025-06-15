import React from 'react';
import { Calendar, User, ChevronDown, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface TaskCardHeaderProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onStatusChange: () => void;
  onDelete?: () => void;
  isOverdue: boolean;
  isEditable: boolean;
  statusColor: string;
  statusIcon: React.ReactNode;
  formattedDateTime: string;
  isTemplate: boolean;
}

const TaskCardHeader: React.FC<TaskCardHeaderProps> = ({
  task,
  isExpanded,
  onToggleExpand,
  onEdit,
  onStatusChange,
  onDelete,
  isOverdue,
  isEditable,
  statusColor,
  statusIcon,
  formattedDateTime,
  isTemplate,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between p-4 gap-3">
      <div className="flex items-start space-x-3 flex-1 min-w-0 w-full">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 shrink-0 text-accent hover:bg-accent/10 mt-1 sm:mt-0" onClick={onToggleExpand}>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </Button>

        <div className="flex-1 min-w-0" onClick={onToggleExpand} style={{ cursor: 'pointer' }}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-primary text-sm break-words mr-2 task-subject">{task.subject}</h3>
            {isTemplate ? (
              <Badge className={`${(task.templateStatus === 'active' || task.templateStatus === undefined) ? 'bg-green-500' : 'bg-slate-500'} flex items-center gap-1 px-2 py-0.5 text-xs shrink-0 text-white`}>
                {(task.templateStatus === 'active' || task.templateStatus === undefined) ? 'Active' : 'Inactive'}
              </Badge>
            ) : (
              <Badge className={`${statusColor} flex items-center gap-1 px-2 py-0.5 text-xs shrink-0`}>
                {statusIcon}
                {task.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            )}
          </div>
          
          <div className="flex flex-col items-start space-y-1 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0 text-xs text-muted-foreground mt-2">
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
          
          {task.labels && task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.labels.map((label, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5 bg-secondary/20 text-secondary border border-secondary/30">
                  {label}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:ml-2 shrink-0 self-end sm:self-auto">
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

        {isTemplate && task.templateStatus === 'inactive' && onDelete && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                className="h-8 w-8"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the recurring task template and all of its associated task instances.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={(e) => { e.stopPropagation(); onDelete(); }}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {isTemplate ? (
          <Button
            onClick={(e) => { e.stopPropagation(); onStatusChange(); }}
            size="sm"
            variant={(task.templateStatus === 'active' || task.templateStatus === undefined) ? 'outline' : 'default'}
            className="text-xs px-3 py-1"
          >
            {(task.templateStatus === 'active' || task.templateStatus === undefined) ? 'Deactivate' : 'Activate'}
          </Button>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default TaskCardHeader;
