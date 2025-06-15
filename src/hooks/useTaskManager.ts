
import { useTasks } from './useTasks';
import { useTaskFilters } from './useTaskFilters';
import { useFilteredTasks } from './useFilteredTasks';
import { useTaskCalculations } from './useTaskCalculations';

export const useTaskManager = () => {
  const {
    tasks,
    setTasks,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
  } = useTasks();

  const {
    searchQuery,
    setSearchQuery,
    selectedDateFilter,
    setSelectedDateFilter,
    statusFilter,
    setStatusFilter,
  } = useTaskFilters();

  const filteredTasks = useFilteredTasks(tasks, searchQuery, selectedDateFilter, statusFilter);
  const { getPendingTasksCount, getTasksCountByDate } = useTaskCalculations(tasks);

  return {
    tasks,
    setTasks,
    searchQuery,
    setSearchQuery,
    selectedDateFilter,
    setSelectedDateFilter,
    statusFilter,
    setStatusFilter,
    filteredTasks,
    handleCreateTask,
    handleUpdateTask,
    handleDeleteTask,
    getPendingTasksCount,
    getTasksCountByDate,
  };
};

