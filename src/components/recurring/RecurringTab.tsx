
import React from 'react';
import { Link } from 'react-router-dom';
import { Task } from '@/types/task';
import TaskFilters from '@/components/TaskFilters';
import TaskList from '@/components/TaskList';
import { Button } from '@/components/ui/button';

interface RecurringTabProps {
  tasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const RecurringTab: React.FC<RecurringTabProps> = ({
  tasks,
  searchQuery,
  setSearchQuery,
  onUpdate,
  onEdit,
}) => {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
        <TaskFilters 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          statusFilter={'all'}
          setStatusFilter={() => {}}
          selectedDateFilter={'all'}
          setSelectedDateFilter={() => {}}
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
      />
    </>
  );
};

export default RecurringTab;
