import React, { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useTaskManager } from '@/hooks/useTaskManager';
import { Task, TaskStatus } from '@/types/task';

import Header from '@/components/Header';
import CreateTaskModal from '@/components/CreateTaskModal';
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
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleEditTask = (task: Task) => {
    toast({
      title: "Coming Soon!",
      description: "You'll be able to edit tasks shortly.",
      variant: "default"
    });
  };
  
  const handleExportTasks = () => {
    if (tasks.length === 0) {
      toast({
        title: "Export Failed",
        description: "No tasks to export.",
        variant: "destructive",
      });
      return;
    }
    const jsonData = JSON.stringify(tasks, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'taskflow_tasks.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Tasks Exported",
      description: "Your tasks have been downloaded as a JSON file.",
    });
  };

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target?.result as string) as Task[];
          if (Array.isArray(importedTasks) && importedTasks.every(t => t.id && t.subject && t.status)) {
            setTasks(importedTasks);
            toast({
              title: "Tasks Imported",
              description: `${importedTasks.length} tasks have been successfully imported.`,
            });
          } else {
            throw new Error("Invalid task structure in JSON file.");
          }
        } catch (error) {
          console.error("Failed to import tasks:", error);
          toast({
            title: "Import Failed",
            description: error instanceof Error ? error.message : "Could not parse the JSON file. Please ensure it's a valid TaskFlow export.",
            variant: "destructive",
          });
        }
      };
      reader.onerror = () => {
        toast({
            title: "Import Failed",
            description: "Error reading the file.",
            variant: "destructive",
          });
      }
      reader.readAsText(file);
    }
    if (importFileRef.current) {
      importFileRef.current.value = "";
    }
  };
  
  const triggerImport = () => importFileRef.current?.click();
  
  const handleViewCompleted = () => {
    setStatusFilter('closed');
    setSelectedDateFilter('all');
  };

  const handleFilterChange = (status: TaskStatus, date: 'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days') => {
    setStatusFilter(status);
    setSelectedDateFilter(date);
  }
  
  const handleNewTaskSubmit = (newTask: Omit<Task, 'id'>) => {
    handleCreateTask(newTask);
    setIsCreateModalOpen(false);
  }

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
        onNewTask={() => setIsCreateModalOpen(true)}
        onImport={triggerImport}
        onExport={handleExportTasks}
        onViewCompleted={handleViewCompleted}
      />

      <div className="relative p-6 pb-8 -mt-8">
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

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleNewTaskSubmit}
      />
    </div>
  );
};

export default Index;
