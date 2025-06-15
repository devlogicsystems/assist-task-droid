
import React from 'react';
import { Task } from '@/types/task';
import DashboardStats from '@/components/DashboardStats';
import OverdueAssigneeChart from '@/components/OverdueAssigneeChart';
import OverdueTrendChart from '@/components/OverdueTrendChart';

interface DashboardTabProps {
  tasks: Task[];
  pendingTasksCount: number;
  todayTasksCount: number;
  next5DaysTasksCount: number;
  next30DaysTasksCount: number;
  onCardClick: (date: 'all' | 'today' | 'next5days' | 'next30days') => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  tasks,
  pendingTasksCount,
  todayTasksCount,
  next5DaysTasksCount,
  next30DaysTasksCount,
  onCardClick,
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
      
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OverdueAssigneeChart tasks={tasks} />
        </div>
        <div>
          <OverdueTrendChart tasks={tasks} />
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
