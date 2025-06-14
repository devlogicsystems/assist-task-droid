import React, { useState } from 'react';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useTaskIO } from '@/hooks/useTaskIO';
import { Task, TaskStatus } from '@/types/task';
import { TaskFormData } from '@/lib/validations/task';
import { mapTaskFormDataToTask } from '@/lib/taskUtils';

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

  const handleEditTask = (task: Task) => {
    setTaskToEdit(task);
    setIsCreateModalOpen(true);
  };

  const triggerImportAndClose = () => triggerImport();

  const handleViewCompleted = () => {
    setStatusFilter('closed');
    setSelectedDateFilter('all');
  };

  const handleFilterChange = (status: TaskStatus, date: 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days') => {
    setStatusFilter(status);
    setSelectedDateFilter(date);
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
      />

      <div className="relative p-6 -mt-8">
        <Tabs defaultValue="dashboard">
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard">
            <div className="border-x border-b border-border rounded-b-md p-6">
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
            </div>
          </TabsContent>
          <TabsContent value="tasks">
            <div className="border-x border-b border-border rounded-b-md p-6">
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
            </div>
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
