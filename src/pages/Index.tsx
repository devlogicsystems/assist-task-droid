import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart3, Plus, CheckCircle, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TaskCard from '@/components/TaskCard';
import CreateTaskModal from '@/components/CreateTaskModal';
import FilterPanel from '@/components/FilterPanel';
import Header from '@/components/Header';
import { Task, TaskStatus } from '@/types/task';
import { useToast } from "@/hooks/use-toast";
import OverdueAssigneeChart from '@/components/OverdueAssigneeChart';
import OverdueTrendChart from '@/components/OverdueTrendChart';

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
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      return storedTasks ? JSON.parse(storedTasks) : sampleTasks;
    } catch (error) {
      console.error("Failed to parse tasks from localStorage:", error);
      return sampleTasks;
    }
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'next5days' | 'next30days'>('all');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all');
  const { toast } = useToast();
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Filter by status first
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter);
    } else {
      // Default to not showing closed tasks unless specifically requested
      filtered = filtered.filter(task => task.status !== 'closed');
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getFutureDate = (days: number) => {
      const date = new Date(today);
      date.setDate(today.getDate() + days);
      return date;
    };
    
    // Date filters only apply if we are not looking at completed tasks
    if (statusFilter !== 'closed') {
        switch (selectedDateFilter) {
          case 'today':
            return filtered.filter(task => new Date(task.dueDate).toDateString() === today.toDateString());
          case 'tomorrow':
            const tomorrow = getFutureDate(1);
            return filtered.filter(task => new Date(task.dueDate).toDateString() === tomorrow.toDateString());
          case 'next5days':
            const fiveDaysFromNow = getFutureDate(4);
            return filtered.filter(task => {
              const taskDueDate = new Date(task.dueDate);
              return taskDueDate >= today && taskDueDate <= fiveDaysFromNow;
            });
          case 'next30days':
            const thirtyDaysFromNow = getFutureDate(29);
            return filtered.filter(task => {
              const taskDueDate = new Date(task.dueDate);
              return taskDueDate >= today && taskDueDate <= thirtyDaysFromNow;
            });
          case 'all':
          default:
            return filtered;
        }
    }

    return filtered;
  }, [tasks, searchQuery, selectedDateFilter, statusFilter]);

  const handleCreateTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTasks(prev => [task, ...prev]);
    setIsCreateModalOpen(false);
    toast({
      title: "Task Created",
      description: `"${task.subject}" has been added.`,
    });
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => (task.id === updatedTask.id ? { ...updatedTask, updatedAt: new Date().toISOString() } : task)));
    toast({
      title: "Task Updated",
      description: `"${updatedTask.subject}" status changed to ${updatedTask.status}.`,
    });
  };

  const handleEditTask = (task: Task) => {
    // As CreateTaskModal is read-only, full edit functionality cannot be implemented yet.
    // This will be implemented in a future step.
    toast({
      title: "Coming Soon!",
      description: "You'll be able to edit tasks shortly.",
      variant: "default"
    });
    // setTaskToEdit(task);
    // setIsCreateModalOpen(true);
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
  
  const triggerImport = () => importFileRef.current?.click();

  const getTasksByStatus = (status: TaskStatus) => tasks.filter(task => task.status === status).length;
  
  const handleViewCompleted = () => {
    setStatusFilter('closed');
    setSelectedDateFilter('all');
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
        onNewTask={() => setIsCreateModalOpen(true)}
        onImport={triggerImport}
        onExport={handleExportTasks}
        onViewCompleted={handleViewCompleted}
      />

      <div className="relative p-6 pb-8 -mt-8">
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
              <CheckCircle className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-dashboardcard-foreground">{getTasksByStatus('closed')}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <OverdueAssigneeChart tasks={tasks} />
          </div>
          <div>
            <OverdueTrendChart tasks={tasks} />
          </div>
        </div>

      </div>
      
      <div className="p-6 space-y-4 bg-card/80 border-b border-border">
        <div className="relative">
          <Input
            placeholder="Search tasks, assignees, details, or labels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-11 h-12 text-base border-2 focus:border-primary bg-background text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
            <Button onClick={() => setStatusFilter('all')} variant={statusFilter === 'all' ? 'default' : 'outline'}>All Active</Button>
            {['today', 'tomorrow', 'next5days', 'next30days'].map((filter) => (
              <Button
                key={filter}
                onClick={() => { setStatusFilter('all'); setSelectedDateFilter(filter as any); }}
                variant={selectedDateFilter === filter && statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className={`whitespace-nowrap ${
                  selectedDateFilter === filter && statusFilter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-lg' 
                    : 'bg-background hover:bg-muted border-2 text-foreground border-border/50'
                }`}
              >
                {filter === 'today' && 'Today'}
                {filter === 'tomorrow' && 'Tomorrow'}
                {filter === 'next5days' && 'Next 5 Days'}
                {filter === 'next30days' && 'Next 30 Days'}
              </Button>
            ))}
        </div>
      </div>

      <div className="bg-background pb-6">
        {filteredTasks.length > 0 ? (
          <div className="border border-border/50 mx-4 mt-4 rounded-lg overflow-hidden shadow-sm">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onEdit={handleEditTask}
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
          </div>
        )}
      </div>

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTask}
      />
    </div>
  );
};

export default Index;
