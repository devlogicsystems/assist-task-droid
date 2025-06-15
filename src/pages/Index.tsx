
import React, { useState, useMemo } from 'react';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useTaskIO } from '@/hooks/useTaskIO';
import { Task, TaskStatus } from '@/types/task';
import { TaskFormData } from '@/lib/validations/task';
import { mapTaskFormDataToTask } from '@/lib/taskUtils';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Header from '@/components/Header';
import CreateTaskModal from '@/components/CreateTaskModal';
import { VoiceCommandModal } from '@/components/VoiceCommandModal';
import { parseVoiceCommand } from '@/lib/voiceParser';
import DashboardTab from '@/components/dashboard/DashboardTab';
import TasksTab from '@/components/tasks/TasksTab';
import RecurringTab from '@/components/recurring/RecurringTab';

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
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [isVoiceCommandModalOpen, setIsVoiceCommandModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [recurringFilter, setRecurringFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const navigate = useNavigate();

  const recurringTaskTemplates = useMemo(() => {
    let filtered = tasks.filter(t => t.recurrence);

    if (recurringFilter !== 'all') {
      if (recurringFilter === 'active') {
        filtered = filtered.filter(t => t.templateStatus === 'active' || typeof t.templateStatus === 'undefined');
      } else { // inactive
        filtered = filtered.filter(t => t.templateStatus === 'inactive');
      }
    }

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
  }, [tasks, searchQuery, recurringFilter]);

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

  const handleDashboardCardClick = (dateFilter: 'all' | 'today' | 'next5days' | 'next30days') => {
    setStatusFilter('all');
    setSelectedDateFilter(dateFilter);
    setActiveTab('tasks');
  };
  
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
            <DashboardTab
              tasks={tasks}
              pendingTasksCount={getPendingTasksCount()}
              todayTasksCount={getTasksCountByDate('today')}
              next5DaysTasksCount={getTasksCountByDate('next5days')}
              next30DaysTasksCount={getTasksCountByDate('next30days')}
              onCardClick={handleDashboardCardClick}
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
              tasks={recurringTaskTemplates}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              recurringFilter={recurringFilter}
              setRecurringFilter={setRecurringFilter}
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
    </div>
  );
};

export default Index;
