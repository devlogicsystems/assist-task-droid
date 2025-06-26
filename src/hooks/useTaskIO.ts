import { useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Task } from '@/types/task';
import { ToastAction } from "@/components/ui/toast";

export interface ExportOptions {
  assignee?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  taskCount?: number;
  exportType: 'assignee-pending' | 'all-pending' | 'date-range' | 'last-10' | 'backup';
}

export const useTaskIO = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const { toast } = useToast();
  const importFileRef = useRef<HTMLInputElement>(null);

  const getFilteredTasks = (options: ExportOptions): Task[] => {
    let filtered = [...tasks];

    switch (options.exportType) {
      case 'backup':
        return filtered; // Return all tasks for backup
      
      case 'assignee-pending':
        filtered = filtered.filter(task => 
          task.assignee === options.assignee && task.status !== 'closed'
        );
        break;
      
      case 'all-pending':
        filtered = filtered.filter(task => 
          task.assignee === options.assignee && task.status !== 'closed'
        );
        break;
      
      case 'last-10':
        filtered = filtered
          .filter(task => task.assignee === options.assignee && task.status !== 'closed')
          .sort((a, b) => new Date(b.createdAt || b.dueDate).getTime() - new Date(a.createdAt || a.dueDate).getTime())
          .slice(0, 10);
        break;
      
      case 'date-range':
        if (options.dateRange) {
          const startDate = new Date(options.dateRange.startDate);
          const endDate = new Date(options.dateRange.endDate);
          filtered = filtered.filter(task => {
            const taskDate = new Date(task.dueDate);
            return task.assignee === options.assignee && 
                   taskDate >= startDate && 
                   taskDate <= endDate &&
                   task.status !== 'closed';
          });
        }
        break;
    }

    return filtered;
  };

  const handleExportTasks = (options?: ExportOptions) => {
    const tasksToExport = options ? getFilteredTasks(options) : tasks.filter(task => !task.recurrence);
    
    if (tasksToExport.length === 0) {
      toast({
        title: "Export Failed",
        description: "No tasks to export with the selected criteria.",
        variant: "destructive",
      });
      return;
    }

    const jsonData = JSON.stringify(tasksToExport, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const fileName = options?.exportType === 'backup' 
      ? 'taskflow_backup.json'
      : `taskflow_${options?.assignee || 'tasks'}_${options?.exportType || 'export'}.json`;
    
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Show success message with file location info
    const openDownloadsFolder = () => {
      // Try to open the downloads folder
      if (navigator.userAgent.includes('Windows')) {
        window.open('file:///C:/Users/' + (process.env.USERNAME || 'User') + '/Downloads');
      } else if (navigator.userAgent.includes('Mac')) {
        window.open('file:///Users/' + (process.env.USER || 'User') + '/Downloads');
      } else {
        // For other systems, just show a generic message
        toast({
          title: "File Location",
          description: "Check your Downloads folder for the exported file.",
        });
      }
    };

    toast({
      title: "Tasks Exported Successfully",
      description: `${tasksToExport.length} tasks exported to Downloads folder as ${fileName}. Click below to open Downloads folder.`,
      duration: 5000,
    });

    // Show additional toast with action to open downloads
    setTimeout(() => {
      toast({
        title: "Open Downloads Folder",
        description: "Click here to open your Downloads folder",
        action: (
          <ToastAction altText="Open Downloads" onClick={openDownloadsFolder}>
            Open Downloads
          </ToastAction>
        )
      });
    }, 1000);
  };

  const handleImportFileSelect = (event: React.ChangeEvent<HTMLInputElement>, importType: 'backup' | 'assigned' = 'backup') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTasks = JSON.parse(e.target?.result as string) as Task[];
          if (Array.isArray(importedTasks) && importedTasks.every(t => t.id && t.subject && t.status)) {
            
            // Check for duplicates
            const existingTaskIds = new Set(tasks.map(t => t.id));
            const duplicateTasks = importedTasks.filter(t => existingTaskIds.has(t.id));
            
            if (duplicateTasks.length > 0) {
              // Show duplicate warning
              const duplicateSubjects = duplicateTasks.map(t => t.subject).join(', ');
              const proceed = window.confirm(
                `${duplicateTasks.length} duplicate task(s) found: ${duplicateSubjects}. Do you want to skip duplicates and continue importing the rest?`
              );
              
              if (!proceed) {
                toast({
                  title: "Import Cancelled",
                  description: "Task import was cancelled by user.",
                });
                return;
              }
            }

            // Filter out duplicates and process tasks
            const uniqueTasks = importedTasks.filter(t => !existingTaskIds.has(t.id));
            
            // If importing assigned tasks, change assignee to "Self"
            const processedTasks = importType === 'assigned' 
              ? uniqueTasks.map(task => ({ ...task, assignee: 'Self' }))
              : uniqueTasks;

            if (processedTasks.length > 0) {
              setTasks(prev => [...prev, ...processedTasks]);
              toast({
                title: "Tasks Imported Successfully",
                description: `${processedTasks.length} tasks imported successfully.${duplicateTasks.length > 0 ? ` ${duplicateTasks.length} duplicates were skipped.` : ''}`,
              });
            } else {
              toast({
                title: "No New Tasks",
                description: "All tasks in the file already exist in your task list.",
              });
            }
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
      };
      reader.readAsText(file);
    }
    if (importFileRef.current) {
      importFileRef.current.value = "";
    }
  };
  
  const triggerImport = (importType: 'backup' | 'assigned' = 'backup') => {
    if (importFileRef.current) {
      importFileRef.current.setAttribute('data-import-type', importType);
      importFileRef.current.click();
    }
  };

  return { 
    importFileRef, 
    triggerImport, 
    handleExportTasks, 
    handleImportFileSelect,
    getFilteredTasks 
  };
};
