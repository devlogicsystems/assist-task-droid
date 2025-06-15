
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TaskStatus } from '@/types/task';

type DateFilter = 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days';

interface TaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: TaskStatus | 'all';
  setStatusFilter: (status: TaskStatus | 'all') => void;
  selectedDateFilter: DateFilter;
  setSelectedDateFilter: (date: DateFilter) => void;
}

const TaskFilters: React.FC<TaskFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  selectedDateFilter,
  setSelectedDateFilter,
}) => {
  return (
    <div className="p-6 space-y-4 bg-card/80 border-b border-border">
      <div className="relative">
        <Input
          placeholder="Search tasks, assignees, details, or labels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 h-12 text-base border-2 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
        />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
          <Button onClick={() => { setStatusFilter('all'); setSelectedDateFilter('all'); }} variant={statusFilter === 'all' && selectedDateFilter === 'all' ? 'default' : 'outline'}>Pending Tasks</Button>
          {(['today', 'tomorrow', 'next5days', 'next30days'] as DateFilter[]).map((filter) => (
            <Button
              key={filter}
              onClick={() => { setStatusFilter('all'); setSelectedDateFilter(filter); }}
              variant={selectedDateFilter === filter && statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              className={`whitespace-nowrap ${
                selectedDateFilter === filter && statusFilter === 'all'
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-background hover:bg-muted border-2 text-foreground border-border/50'
              }`}
            >
              {filter === 'today' && 'Today'}
              {filter === 'tomorrow' && 'Tomorrow'}
              {filter === 'next5days' && 'Next 5 Days'}
              {filter === 'next30days' && 'Next 30 Days'}
            </Button>
          ))}
      </div>
    </div>
  );
};

export default TaskFilters;
