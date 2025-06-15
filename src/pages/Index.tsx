
import React, { useState, useMemo } from 'react';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useTaskIO } from '@/hooks/useTaskIO';
import { Task, TaskStatus } from '@/types/task';
import { TaskFormData } from '@/lib/validations/task';
import { mapTaskFormDataToTask } from '@/lib/taskUtils';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import CreateTaskModal from '@/components/CreateTaskModal';
import { VoiceCommandModal } from '@/components/VoiceCommandModal';
import { parseVoiceCommand } from '@/lib/voiceParser';
import DashboardStats from '@/components/DashboardStats';
import OverdueAssigneeChart from '@/components/OverdueAssigneeChart';
import OverdueTrendChart from '@/components/OverdueTrendChart';
import TaskFilters from '@/components/TaskFilters';
import TaskList from '@/components/TaskList';

const Index = () => {
  const {
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
    getTasksByStatus,
  } = useTaskManager();
  
  const { importFileRef, triggerImport, handleExportTasks, handleImportFileSelect } = useTaskIO(tasks, setTasks);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isVoiceCommandModalOpen, setIsVoiceCommandModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const recurringTaskTemplates = useMemo(() => {
    let filtered = tasks.filter(t => t.recurrence);

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(task =>
            task.subject.toLowerCase().includes(lowercasedQuery) ||
            task.assignee.toLowerCase().includes(lowercasedQuery) ||
            (task.details && task.details.toLowerCase().includes(lowercasedQuery)) ||
            task.labels.some(label => label.toLowerCase().includes(lowercasedQuery))
        );
    }
    return filtered;
  }, [tasks, searchQuery]);

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsCreateModalOpen(true);
  };
  
  const handleEditRecurringTask = (task: Task) => {
    navigate(`/edit-recurring/${task.id}`);
  };

  const handleAddRecurringTask = () => navigate('/create-recurring');

  const triggerImportAndClose = () => triggerImport();

  const handleViewCompleted = () => {
    setStatusFilter('closed');
    setSelectedDateFilter('all');
    setActiveTab('tasks');
  };

  const handleFilterChange = (status: TaskStatus, date: 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days') => {
    setStatusFilter(status);
    setSelectedDateFilter(date);
    setActiveTab('tasks');
  }
  
  const handleTaskFormSubmit = (data: TaskFormData) => {
    if (taskToEdit) {
      const updatedTask = mapTaskFormDataToTask(data, taskToEdit);
      handleUpdateTask(updatedTask);
    } else {
      handleCreateTask(data);
    }
    setIsCreateModalOpen(false);
    setTaskToEdit(null);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setTaskToEdit(null);
  };
  
  const handleVoiceTaskCreation = () => {
    setIsVoiceCommandModalOpen(true);
  };

  const handleVoiceCommandSubmit = (transcript: string) => {
    const parsedData = parseVoiceCommand(transcript);
    const taskData: TaskFormData = {
        subject: parsedData.subject || transcript,
        details: '',
        assignee: parsedData.assignee || '',
        dueDate: parsedData.dueDate || '',
        dueTime: parsedData.dueTime || '',
        isFullDay: !parsedData.dueTime,
        reminderTime: '',
        labels: [],
        url: '',
        recurrence: undefined,
    };
    handleCreateTask(taskData);
    setIsVoiceCommandModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <input
        type="file"
        ref={importFileRef}
        onChange={handleImportFileSelect}
        accept=".json"
        className="hidden"
      />
      
      <Header
        onNewTask={() => { setTaskToEdit(null); setIsCreateModalOpen(true); }}
        onImport={triggerImportAndClose}
        onExport={handleExportTasks}
        onViewCompleted={handleViewCompleted}
        onVoiceTask={handleVoiceTaskCreation}
        onAddRecurringTask={handleAddRecurringTask}
      />

      <div className="relative p-6 pb-8 -mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard">
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
          </TabsContent>
          <TabsContent value="tasks">
            <TaskFilters 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedDateFilter={selectedDateFilter}
              setSelectedDateFilter={setSelectedDateFilter}
            />

            <TaskList
              tasks={filteredTasks}
              searchQuery={searchQuery}
              onUpdate={handleUpdateTask}
              onEdit={handleEditTask}
            />
          </TabsContent>
          <TabsContent value="recurring">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
              <TaskFilters 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                statusFilter={'all'}
                setStatusFilter={() => {}}
                selectedDateFilter={'all'}
                setSelectedDateFilter={() => {}}
              />
              <Button asChild>
                <Link to="/create-recurring">
                  Create New Template
                </Link>
              </Button>
            </div>
            
            <TaskList
              tasks={recurringTaskTemplates}
              searchQuery={searchQuery}
              onUpdate={handleUpdateTask}
              onEdit={handleEditRecurringTask}
            />
          </TabsContent>
        </Tabs>
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={handleModalClose}
        onSubmit={handleTaskFormSubmit}
        taskToEdit={taskToEdit}
      />

      <VoiceCommandModal
        isOpen={isVoiceCommandModalOpen}
        onClose={() => setIsVoiceCommandModalOpen(false)}
        onSubmit={handleVoiceCommandSubmit}
      />
    </div>
  );
};

export default Index;
