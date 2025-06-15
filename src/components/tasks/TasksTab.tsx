
import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import TaskFilters from '@/components/TaskFilters';
import TaskList from '@/components/TaskList';

type DateFilter = 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days';

interface TasksTabProps {
  filteredTasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: TaskStatus | 'all';
  setStatusFilter: (status: TaskStatus | 'all') => void;
  selectedDateFilter: DateFilter;
  setSelectedDateFilter: (date: DateFilter) => void;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
}

const TasksTab: React.FC<TasksTabProps> = ({
  filteredTasks,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedDateFilter,
  setSelectedDateFilter,
  onUpdate,
  onEdit,
}) => {
  return (
    <>
      <TaskFilters 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedDateFilter={selectedDateFilter}
        setSelectedDateFilter={setSelectedDateFilter}
      />

      <TaskList
        tasks={filteredTasks}
        searchQuery={searchQuery}
        onUpdate={onUpdate}
        onEdit={onEdit}
      />
    </>
  );
};

export default TasksTab;
