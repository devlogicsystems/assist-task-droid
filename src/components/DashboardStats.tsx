
import React from 'react';
import { User, Clock, CheckCircle } from 'lucide-react';
import { TaskStatus } from '@/types/task';

type DateFilter = 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days';

interface DashboardStatsProps {
  assignedCount: number;
  inProgressCount: number;
  completedCount: number;
  onFilterChange: (status: TaskStatus, date: DateFilter) => void;
  onViewCompleted: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; count: number; onClick: () => void; }> = ({ icon, title, count, onClick }) => (
  <div className="glass-effect rounded-lg p-4 text-center cursor-pointer hover:bg-card/60 transition-colors" onClick={onClick}>
    <div className="flex items-center justify-center mb-2">
      {icon}
    </div>
    <div className="text-2xl font-bold text-dashboardcard-foreground">{count}</div>
    <div className="text-sm text-muted-foreground">{title}</div>
  </div>
);

const DashboardStats: React.FC<DashboardStatsProps> = ({ assignedCount, inProgressCount, completedCount, onFilterChange, onViewCompleted }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard 
        icon={<User className="w-5 h-5 text-accent" />}
        title="Assigned"
        count={assignedCount}
        onClick={() => onFilterChange('assigned', 'today')}
      />
      <StatCard 
        icon={<Clock className="w-5 h-5 text-secondary" />}
        title="In Progress"
        count={inProgressCount}
        onClick={() => onFilterChange('in-progress', 'all')}
      />
      <StatCard 
        icon={<CheckCircle className="w-5 h-5 text-green-500" />}
        title="Completed"
        count={completedCount}
        onClick={onViewCompleted}
      />
    </div>
  );
};

export default DashboardStats;
