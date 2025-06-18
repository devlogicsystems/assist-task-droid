
import React, { useState } from 'react';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useTaskIO } from '@/hooks/useTaskIO';
import { Task } from '@/types/task';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import CreateTaskModal from '@/components/CreateTaskModal';
import { VoiceCommandModal } from '@/components/VoiceCommandModal';
import DashboardTab from '@/components/dashboard/DashboardTab';
import TasksTab from '@/components/tasks/TasksTab';
import RecurringTab from '@/components/recurring/RecurringTab';
import { useTaskModals } from '@/hooks/useTaskModals';
import { useTaskReminders } from '@/hooks/useTaskReminders';
import TaskReminderModal from '@/components/TaskReminderModal';

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
    handleDeleteTask,
    getPendingTasksCount,
    getTasksCountByDate,
  } = useTaskManager();
  
  const { importFileRef, triggerImport, handleExportTasks, handleImportFileSelect } = useTaskIO(tasks, setTasks);
  
  const {
    isCreateModalOpen,
    taskToEdit,
    isVoiceCommandModalOpen,
    setIsVoiceCommandModalOpen,
    handleEditTask,
    handleTaskFormSubmit,
    handleModalClose,
    handleVoiceTaskCreation,
    handleVoiceCommandSubmit,
    openCreateTaskModal
  } = useTaskModals({ handleCreateTask, handleUpdateTask });

  const {
    activeReminderTask,
    setActiveReminderTask,
    handleSnooze,
    handleActionTaken
  } = useTaskReminders(tasks, handleUpdateTask);

  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  const handleEditRecurringTask = (task: Task) => {
    navigate(`/edit-recurring/${task.id}`);
  };

  const handleAddRecurringTask = () => navigate('/create-recurring');

  const handleViewCompleted = () => {
    setStatusFilter('closed');
    setSelectedDateFilter('all');
    setActiveTab('tasks');
  };

  const handleDashboardCardClick = (dateFilter: 'all' | 'today' | 'next5days' | 'next30days') => {
    setStatusFilter('all');
    setSelectedDateFilter(dateFilter);
    setActiveTab('tasks');
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
        onNewTask={openCreateTaskModal}
        onImport={triggerImport}
        onExport={handleExportTasks}
        onViewCompleted={handleViewCompleted}
        onVoiceTask={handleVoiceTaskCreation}
        onAddRecurringTask={handleAddRecurringTask}
      />

      <div className="relative p-3 sm:p-6 pb-8 -mt-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-center">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="recurring">Recurring</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="dashboard">
            <DashboardTab
              tasks={tasks}
              pendingTasksCount={getPendingTasksCount()}
              todayTasksCount={getTasksCountByDate('today')}
              next5DaysTasksCount={getTasksCountByDate('next5days')}
              next30DaysTasksCount={getTasksCountByDate('next30days')}
              onCardClick={handleDashboardCardClick}
              onTaskUpdate={handleUpdateTask}
              onTaskEdit={handleEditTask}
            />
          </TabsContent>
          <TabsContent value="tasks">
            <TasksTab
              filteredTasks={filteredTasks}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              selectedDateFilter={selectedDateFilter}
              setSelectedDateFilter={setSelectedDateFilter}
              onUpdate={handleUpdateTask}
              onEdit={handleEditTask}
            />
          </TabsContent>
          <TabsContent value="recurring">
            <RecurringTab
              allTasks={tasks}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onUpdate={handleUpdateTask}
              onEdit={handleEditRecurringTask}
              onDelete={handleDeleteTask}
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

      <TaskReminderModal
        task={activeReminderTask}
        isOpen={!!activeReminderTask}
        onClose={() => setActiveReminderTask(null)}
        onSnooze={handleSnooze}
        onActionTaken={handleActionTaken}
      />
    </div>
  );
};

export default Index;
