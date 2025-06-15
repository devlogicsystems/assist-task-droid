
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Task } from '@/types/task';
import RecurringTaskFilters from './RecurringTaskFilters';
import TaskList from '@/components/TaskList';
import { Button } from '@/components/ui/button';

interface RecurringTabProps {
  allTasks: Task[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onUpdate: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const RecurringTab: React.FC<RecurringTabProps> = ({
  allTasks,
  searchQuery,
  setSearchQuery,
  onUpdate,
  onEdit,
  onDelete,
}) => {
  const [recurringFilter, setRecurringFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const recurringTaskTemplates = useMemo(() => {
    let filtered = allTasks.filter(t => t.recurrence);

    if (recurringFilter !== 'all') {
      if (recurringFilter === 'active') {
        filtered = filtered.filter(t => t.templateStatus === 'active' || typeof t.templateStatus === 'undefined');
      } else { // inactive
        filtered = filtered.filter(t => t.templateStatus === 'inactive');
      }
    }

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(task =>
            task.subject.toLowerCase().includes(lowercasedQuery) ||
            task.assignee.toLowerCase().includes(lowercasedQuery) ||
            (task.details && task.details.toLowerCase().includes(lowercasedQuery)) ||
            task.labels.some(label => label.toLowerCase().includes(lowercasedQuery))
        );
    }
    return filtered;
  }, [allTasks, searchQuery, recurringFilter]);

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
        tasks={recurringTaskTemplates}
        searchQuery={searchQuery}
        onUpdate={onUpdate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
};

export default RecurringTab;
