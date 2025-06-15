
import React from 'react';
import { ListTodo, Calendar, CalendarClock, CalendarDays } from 'lucide-react';

interface DashboardStatsProps {
  pendingTasksCount: number;
  todayTasksCount: number;
  next5DaysTasksCount: number;
  next30DaysTasksCount: number;
  onCardClick: (date: 'all' | 'today' | 'next5days' | 'next30days') => void;
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

const DashboardStats: React.FC<DashboardStatsProps> = ({ 
    pendingTasksCount, 
    todayTasksCount, 
    next5DaysTasksCount, 
    next30DaysTasksCount, 
    onCardClick 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon={<ListTodo className="w-5 h-5 text-accent" />}
        title="Total Pending Tasks"
        count={pendingTasksCount}
        onClick={() => onCardClick('all')}
      />
      <StatCard 
        icon={<Calendar className="w-5 h-5 text-secondary" />}
        title="Today's Tasks"
        count={todayTasksCount}
        onClick={() => onCardClick('today')}
      />
      <StatCard 
        icon={<CalendarClock className="w-5 h-5 text-green-500" />}
        title="Due in next 5 days"
        count={next5DaysTasksCount}
        onClick={() => onCardClick('next5days')}
      />
      <StatCard 
        icon={<CalendarDays className="w-5 h-5 text-blue-500" />}
        title="Due in next 30 days"
        count={next30DaysTasksCount}
        onClick={() => onCardClick('next30days')}
      />
    </div>
  );
};

export default DashboardStats;
