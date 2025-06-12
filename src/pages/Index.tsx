
import React, { useState } from 'react';
import { Calendar, Plus, Search, Filter, User, Clock, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import TaskCard from '@/components/TaskCard';
import CreateTaskModal from '@/components/CreateTaskModal';
import FilterPanel from '@/components/FilterPanel';
import { Task, TaskStatus } from '@/types/task';

const sampleTasks: Task[] = [
  {
    id: '1',
    subject: 'Review Project Proposal',
    details: 'Review and provide feedback on the Q4 marketing proposal',
    assignee: 'John Doe',
    dueDate: '2024-06-12',
    dueTime: '14:30',
    reminderTime: '14:20',
    status: 'assigned',
    labels: ['High Priority', 'Marketing'],
    isFullDay: false
  },
  {
    id: '2',
    subject: 'Team Meeting Preparation',
    details: 'Prepare agenda and materials for weekly team sync',
    assignee: 'Jane Smith',
    dueDate: '2024-06-13',
    dueTime: '10:00',
    reminderTime: '09:50',
    status: 'in-progress',
    labels: ['Meeting', 'Team'],
    isFullDay: false
  },
  {
    id: '3',
    subject: 'Client Presentation',
    details: 'Present new product features to client stakeholders',
    assignee: 'Mike Johnson',
    dueDate: '2024-06-14',
    isFullDay: true,
    reminderTime: '09:00',
    status: 'assigned',
    labels: ['Client', 'Presentation'],
    url: 'https://meet.google.com/abc-def-ghi'
  }
];

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days'>('all');

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status).length;
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const next5Days = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
    const next30Days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    switch (selectedFilter) {
      case 'today':
        return filtered.filter(task => task.dueDate === today);
      case 'tomorrow':
        return filtered.filter(task => task.dueDate === tomorrow);
      case 'next5days':
        return filtered.filter(task => task.dueDate <= next5Days && task.dueDate >= today);
      case 'next30days':
        return filtered.filter(task => task.dueDate <= next30Days && task.dueDate >= today);
      default:
        return filtered.filter(task => task.status !== 'closed');
    }
  };

  const handleCreateTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
    };
    setTasks(prev => [...prev, task]);
    setIsCreateModalOpen(false);
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">TaskFlow</h1>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="sm"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold">{getTasksByStatus('assigned')}</div>
            <div className="text-sm opacity-90">Assigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{getTasksByStatus('in-progress')}</div>
            <div className="text-sm opacity-90">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{getTasksByStatus('closed')}</div>
            <div className="text-sm opacity-90">Completed</div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tasks or assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'today', 'tomorrow', 'next5days', 'next30days'].map((filter) => (
            <Button
              key={filter}
              onClick={() => setSelectedFilter(filter as any)}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              className="whitespace-nowrap"
            >
              {filter === 'all' && 'All Tasks'}
              {filter === 'today' && 'Today'}
              {filter === 'tomorrow' && 'Tomorrow'}
              {filter === 'next5days' && 'Next 5 Days'}
              {filter === 'next30days' && 'Next 30 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="px-4 pb-20">
        <div className="space-y-3">
          {getFilteredTasks().map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdate={handleUpdateTask}
            />
          ))}
          {getFilteredTasks().length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No tasks found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

export default Index;
