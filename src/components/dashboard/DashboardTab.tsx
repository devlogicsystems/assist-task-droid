
import React from 'react';
import { Task, TaskStatus } from '@/types/task';
import DashboardStats from '@/components/DashboardStats';
import OverdueAssigneeChart from '@/components/OverdueAssigneeChart';
import OverdueTrendChart from '@/components/OverdueTrendChart';

type DateFilter = 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days';

interface DashboardTabProps {
  tasks: Task[];
  getTasksByStatus: (status: TaskStatus) => number;
  handleFilterChange: (status: TaskStatus, date: DateFilter) => void;
  handleViewCompleted: () => void;
}

const DashboardTab: React.FC<DashboardTabProps> = ({
  tasks,
  getTasksByStatus,
  handleFilterChange,
  handleViewCompleted,
}) => {
  return (
    <>
      <DashboardStats
        assignedCount={getTasksByStatus('assigned')}
        inProgressCount={getTasksByStatus('in-progress')}
        completedCount={getTasksByStatus('closed')}
        onFilterChange={handleFilterChange}
        onViewCompleted={handleViewCompleted}
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
