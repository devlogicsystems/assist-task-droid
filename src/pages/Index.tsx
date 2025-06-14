import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, Search, Filter, User, Clock, CheckCircle, BarChart3, Menu as MenuIcon, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import TaskCard from '@/components/TaskCard';
import CreateTaskModal from '@/components/CreateTaskModal';
import FilterPanel from '@/components/FilterPanel';
import DarkModeToggle from '@/components/DarkModeToggle';
import { Task, TaskStatus } from '@/types/task';
import { useToast } from "@/hooks/use-toast";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";

const sampleTasks: Task[] = [
  {
    id: '1',
    subject: 'Review Project Proposal',
    details: 'Review and provide feedback on the Q4 marketing proposal. Ensure all financial projections are accurate and marketing strategies align with company goals for the next quarter. Double check the competitive analysis section.',
    assignee: 'John Doe',
    dueDate: '2024-06-12', // Note: This date is in the past
    dueTime: '14:30',
    reminderTime: '14:20',
    status: 'assigned',
    labels: ['High Priority', 'Marketing', 'Q4 Planning'],
    isFullDay: false,
    url: 'https://example.com/proposal.pdf'
  },
  {
    id: '2',
    subject: 'Team Meeting Preparation',
    details: 'Prepare agenda and materials for weekly team sync. Topics to include: project updates, KPI review, and upcoming sprint planning. Collect input from all team members for agenda items.',
    assignee: 'Jane Smith',
    dueDate: '2024-06-13', // Note: This date is in the past
    dueTime: '10:00',
    reminderTime: '09:50',
    status: 'in-progress',
    labels: ['Meeting', 'Team Sync', 'Operations'],
    isFullDay: false
  },
  {
    id: '3',
    subject: 'Client Presentation Design',
    details: 'Design slides for the new product feature presentation to client X. Focus on clear visuals and concise messaging. Incorporate latest branding guidelines.',
    assignee: 'Mike Johnson',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Due in 2 days
    isFullDay: true,
    reminderTime: '09:00',
    status: 'assigned',
    labels: ['Client Facing', 'Presentation', 'Design', 'Product Launch'],
    url: 'https://meet.google.com/abc-def-ghi'
  },
  {
    id: '4',
    subject: 'Develop New API Endpoint',
    details: 'Develop and test the new /users/preferences API endpoint. Ensure proper authentication and validation. Write unit and integration tests.',
    assignee: 'Alice Brown',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // Due in 7 days
    dueTime: '17:00',
    reminderTime: '16:30',
    status: 'assigned',
    labels: ['Development', 'API', 'Backend'],
    isFullDay: false
  }
];

const TASKS_STORAGE_KEY = 'taskflow_tasks';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    try {
      return storedTasks ? JSON.parse(storedTasks) : sampleTasks;
    } catch (error) {
      console.error("Failed to parse tasks from localStorage:", error);
      return sampleTasks; // Fallback to sample tasks if parsing fails
    }
  });
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days'>('all');
  const { toast } = useToast();
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter(task => task.status === status).length;
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.details && task.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
        task.labels.some(label => label.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today
    
    const getFutureDate = (days: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + days);
      return date;
    };

    // Active tasks are those not 'closed'
    const activeTasks = filtered.filter(task => task.status !== 'closed');

    switch (selectedFilter) {
      case 'today':
        return activeTasks.filter(task => new Date(task.dueDate).toDateString() === today.toDateString());
      case 'tomorrow':
        const tomorrow = getFutureDate(1);
        return activeTasks.filter(task => new Date(task.dueDate).toDateString() === tomorrow.toDateString());
      case 'next5days':
        const fiveDaysFromNow = getFutureDate(4); // today + 4 days = 5 days inclusive
        return activeTasks.filter(task => {
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate >= today && taskDueDate <= fiveDaysFromNow;
        });
      case 'next30days':
        const thirtyDaysFromNow = getFutureDate(29); // today + 29 days = 30 days inclusive
        return activeTasks.filter(task => {
          const taskDueDate = new Date(task.dueDate);
          return taskDueDate >= today && taskDueDate <= thirtyDaysFromNow;
        });
      case 'all':
      default:
        return activeTasks; // Default to all non-closed tasks
    }
  };

  const handleCreateTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(), // Simple ID generation
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]); // Add new task to the beginning
    setIsCreateModalOpen(false);
    toast({
      title: "Task Created",
      description: `"${task.subject}" has been added.`,
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => (task.id === updatedTask.id ? {...updatedTask, updatedAt: new Date().toISOString()} : task)));
    toast({
      title: "Task Updated",
      description: `"${updatedTask.subject}" status changed to ${updatedTask.status}.`,
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
          // Basic validation for imported tasks
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
    // Reset file input to allow importing the same file again if needed
    if (importFileRef.current) {
      importFileRef.current.value = "";
    }
  };

  const triggerImport = () => {
    importFileRef.current?.click();
  };
  
  const allTasksCount = tasks.length;
  const closedTasksCount = tasks.filter(task => task.status === 'closed').length;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <input
        type="file"
        ref={importFileRef}
        onChange={handleImportFileSelect}
        accept=".json"
        className="hidden"
      />
      {/* Modern Header with Corporate Colors */}
      <div className="bg-primary text-primary-foreground relative overflow-hidden">
        {/* Modern Header with Corporate Colors */}
        <div className="absolute inset-0 bg-black/10">
          <div className="absolute inset-0 opacity-10">
            <svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <g fill="none" fillRule="evenodd">
                <g fill="#ffffff" fillOpacity="0.1">
                  <circle cx="30" cy="30" r="2"/>
                </g>
              </g>
            </svg>
          </div>
        </div>
        
        <div className="relative p-6 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Menubar className="bg-transparent border-none p-0 h-auto">
                <MenubarMenu>
                  <MenubarTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                      <MenuIcon className="w-6 h-6" />
                    </Button>
                  </MenubarTrigger>
                  <MenubarContent>
                    <MenubarItem onClick={triggerImport}>
                      <Upload className="mr-2 h-4 w-4" /> Import Tasks
                    </MenubarItem>
                    <MenubarItem onClick={handleExportTasks}>
                      <Download className="mr-2 h-4 w-4" /> Export Tasks
                    </MenubarItem>
                    <MenubarSeparator />
                    <MenubarItem onClick={() => setIsCreateModalOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> New Task
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
              <div>
                <h1 className="text-3xl font-bold text-primary-foreground">TaskFlow</h1>
                <p className="text-primary-foreground/80 text-sm mt-1">Organize your work efficiently</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <DarkModeToggle />
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 border border-accent shadow-lg font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-effect rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <User className="w-5 h-5 text-accent" />
              </div>
              <div className="text-2xl font-bold text-dashboardcard-foreground">{getTasksByStatus('assigned')}</div>
              <div className="text-sm text-muted-foreground">Assigned</div>
            </div>
            
            <div className="glass-effect rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-5 h-5 text-secondary" />
              </div>
              <div className="text-2xl font-bold text-dashboardcard-foreground">{getTasksByStatus('in-progress')}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            
            <div className="glass-effect rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> {/* Using a specific green for completed */}
              </div>
              <div className="text-2xl font-bold text-dashboardcard-foreground">{closedTasksCount}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="p-6 space-y-4 bg-card/80 border-b border-border"> {/* Adjusted bg for contrast */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search tasks, assignees, details, or labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-base border-2 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
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
                  ? 'bg-primary text-primary-foreground shadow-lg' 
                  : 'bg-background hover:bg-muted border-2 text-foreground border-border/50'
              }`}
            >
              {filter === 'all' && `All Active (${getFilteredTasks().length})`}
              {filter === 'today' && 'Today'}
              {filter === 'tomorrow' && 'Tomorrow'}
              {filter === 'next5days' && 'Next 5 Days'}
              {filter === 'next30days' && 'Next 30 Days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-background pb-6">
        {getFilteredTasks().length > 0 ? (
          <div className="border border-border/50 mx-4 mt-4 rounded-lg overflow-hidden shadow-sm">
            {getFilteredTasks().map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="bg-card rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow">
              <BarChart3 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              {searchQuery ? "No tasks match your search." : "No tasks for this filter."}
            </h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery ? "Try a different search term or clear the search." : "Try adjusting your filter criteria or create a new task!"}
            </p>
            {!searchQuery && selectedFilter === 'all' && tasks.filter(t => t.status !== 'closed').length === 0 && (
              <Button onClick={() => setIsCreateModalOpen(true)} className="mt-4">
                <Plus className="w-4 h-4 mr-2" /> Create Your First Task
              </Button>
            )}
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
