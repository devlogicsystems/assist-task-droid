
import React from 'react';
import { BarChart3 } from 'lucide-react';
import TaskCard from '@/components/TaskCard';
import { Task } from '@/types/task';

interface TaskListProps {
  tasks: Task[];
  searchQuery: string;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, searchQuery, onUpdate, onEdit, onDelete }) => {
  return (
    <div className="bg-background pb-6">
      {tasks.length > 0 ? (
        <div className="border border-border/50 mx-4 mt-4 rounded-lg overflow-hidden shadow-sm">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={onUpdate}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="bg-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow">
            <BarChart3 className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            {searchQuery ? "No tasks match your search." : "No tasks for this filter."}
          </h3>
          <p className="text-muted-foreground text-sm">
            {searchQuery ? "Try a different search term or clear the search." : "Try adjusting your filter criteria or create a new task!"}
          </p>
        </div>
      )}
    </div>
  );
};

export default TaskList;
