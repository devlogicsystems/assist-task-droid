
import React from 'react';
import { Task } from '@/types/task';
import { Clock, FileText, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TaskCardExpandedContentProps {
  task: Task;
  onEdit?: () => void;
}

const TaskCardExpandedContent: React.FC<TaskCardExpandedContentProps> = ({ task, onEdit }) => {
  return (
    <div className="px-2 sm:px-4 pb-3 sm:pb-4 border-t border-border/20 animate-expand">
      <div className="pt-3 space-y-3">
        {/* Task Details */}
        <div>
          <p className="text-sm text-foreground leading-relaxed">{task.details}</p>
        </div>

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

        {/* Mobile Edit Button - Only icon */}
        {onEdit && (
          <div className="sm:hidden pt-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              variant="outline"
              size="icon"
              className="w-8 h-8"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCardExpandedContent;
