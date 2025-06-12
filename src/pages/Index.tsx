
import React, { useState } from 'react';
import { Calendar, Plus, Search, Filter, User, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
      {/* Modern Header with Gradient */}
      <div className="gradient-header text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>
        
        <div className="relative p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">TaskFlow</h1>
              <p className="text-white/80 text-sm mt-1">Organize your work efficiently</p>
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="glass-effect">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">{getTasksByStatus('assigned')}</div>
                <div className="text-sm text-muted-foreground">Assigned</div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">{getTasksByStatus('in-progress')}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            
            <Card className="glass-effect">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="text-2xl font-bold text-foreground">{getTasksByStatus('closed')}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="p-6 space-y-4 bg-white border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search tasks or assignees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-base border-2 focus:border-primary"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {['all', 'today', 'tomorrow', 'next5days', 'next30days'].map((filter) => (
            <Button
              key={filter}
              onClick={() => setSelectedFilter(filter as any)}
              variant={selectedFilter === filter ? 'default' : 'outline'}
              size="sm"
              className={`whitespace-nowrap ${
                selectedFilter === filter 
                  ? 'bg-primary shadow-lg' 
                  : 'bg-white hover:bg-gray-50 border-2'
              }`}
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
      <div className="px-6 py-4 pb-20">
        {getFilteredTasks().length > 0 ? (
          <div className="space-y-4">
            {getFilteredTasks().map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

export default Index;
