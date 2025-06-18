
import React from 'react';
import { Task } from '@/types/task';
import DashboardStats from '@/components/DashboardStats';
import OverdueAssigneeList from '@/components/OverdueAssigneeList';

interface DashboardTabProps {
  tasks: Task[];
  pendingTasksCount: number;
  todayTasksCount: number;
  next5DaysTasksCount: number;
  next30DaysTasksCount: number;
  onCardClick: (date: 'all' | 'today' | 'next5days' | 'next30days') => void;
  onTaskUpdate: (task: Task) => void;
  onTaskEdit: (task: Task) => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  tasks,
  pendingTasksCount,
  todayTasksCount,
  next5DaysTasksCount,
  next30DaysTasksCount,
  onCardClick,
  onTaskUpdate,
  onTaskEdit,
}) => {
  return (
    <>
      <DashboardStats
        pendingTasksCount={pendingTasksCount}
        todayTasksCount={todayTasksCount}
        next5DaysTasksCount={next5DaysTasksCount}
        next30DaysTasksCount={next30DaysTasksCount}
        onCardClick={onCardClick}
      />
      
      <div className="mt-6">
        <OverdueAssigneeList 
          tasks={tasks} 
          onTaskUpdate={onTaskUpdate}
          onTaskEdit={onTaskEdit}
        />
      </div>
    </>
  );
};

export default DashboardTab;
