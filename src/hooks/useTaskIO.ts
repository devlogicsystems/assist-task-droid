
import { useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Task } from '@/types/task';

export const useTaskIO = (
  tasks: Task[],
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>
) => {
  const { toast } = useToast();
  const importFileRef = useRef<HTMLInputElement>(null);

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

  return { importFileRef, triggerImport, handleExportTasks, handleImportFileSelect };
};
