
import { useState } from 'react';
import { TaskStatus } from '@/types/task';

export type DateFilter = 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days';

export const useTaskFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<DateFilter>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');

  return {
    searchQuery,
    setSearchQuery,
    selectedDateFilter,
    setSelectedDateFilter,
    statusFilter,
    setStatusFilter,
  };
};

