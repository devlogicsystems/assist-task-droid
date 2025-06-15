
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { Clock, FileText } from 'lucide-react';

interface TaskCardExpandedContentProps {
  task: Task;
}

const TaskCardExpandedContent: React.FC<TaskCardExpandedContentProps> = ({ task }) => {
  return (
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
  );
};

export default TaskCardExpandedContent;
