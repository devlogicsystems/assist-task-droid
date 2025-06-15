
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RecurringTaskFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  recurringFilter: 'all' | 'active' | 'inactive';
  setRecurringFilter: (filter: 'all' | 'active' | 'inactive') => void;
}

const RecurringTaskFilters: React.FC<RecurringTaskFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  recurringFilter,
  setRecurringFilter,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <Input
        type="text"
        placeholder="Search templates..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-xs"
      />
      <Select value={recurringFilter} onValueChange={setRecurringFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default RecurringTaskFilters;
