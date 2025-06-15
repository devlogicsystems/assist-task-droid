
import React from 'react';
import { Link } from 'react-router-dom';
import { Task } from '@/types/task';
import RecurringTaskFilters from './RecurringTaskFilters';
import TaskList from '@/components/TaskList';
import { Button } from '@/components/ui/button';

interface RecurringTabProps {
  tasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recurringFilter: 'all' | 'active' | 'inactive';
  setRecurringFilter: (filter: 'all' | 'active' | 'inactive') => void;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const RecurringTab: React.FC<RecurringTabProps> = ({
  tasks,
  searchQuery,
  setSearchQuery,
  recurringFilter,
  setRecurringFilter,
  onUpdate,
  onEdit,
  onDelete,
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <RecurringTaskFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          recurringFilter={recurringFilter}
          setRecurringFilter={setRecurringFilter}
        />
        <Button asChild>
          <Link to="/create-recurring">
            Create New Template
          </Link>
        </Button>
      </div>
      
      <TaskList
        tasks={tasks}
        searchQuery={searchQuery}
        onUpdate={onUpdate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
};

export default RecurringTab;
