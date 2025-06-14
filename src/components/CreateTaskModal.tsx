
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Mic } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { parseVoiceCommand } from '@/lib/voiceParser';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { taskFormSchema, TaskFormData } from '@/lib/validations/task';
import { Task } from '@/types/task';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskFormData) => void;
  taskToEdit?: Task | null;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onSubmit, taskToEdit }) => {
  const [currentLabel, setCurrentLabel] = useState('');
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const isEditing = !!taskToEdit;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      subject: '',
      details: '',
      assignee: '',
      dueDate: '',
      dueTime: '',
      reminderTime: '',
      isFullDay: false,
      labels: [],
      url: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && taskToEdit) {
        form.reset({
          subject: taskToEdit.subject,
          details: taskToEdit.details || '',
          assignee: taskToEdit.assignee,
          dueDate: taskToEdit.dueDate,
          dueTime: taskToEdit.dueTime || '',
          reminderTime: taskToEdit.reminderTime || '',
          isFullDay: taskToEdit.isFullDay,
          labels: taskToEdit.labels || [],
          url: taskToEdit.url || '',
        });
        if(taskToEdit.url) {
          setShowMoreOptions(true);
        }
      } else {
        form.reset();
        setShowMoreOptions(false);
      }
    }
  }, [isOpen, isEditing, taskToEdit, form]);

  const onValidSubmit = (data: TaskFormData) => {
    let reminderTime = data.reminderTime;
    if (!reminderTime && data.dueTime && !data.isFullDay) {
      const [hours, minutes] = data.dueTime.split(':');
      const dueDateTime = new Date();
      dueDateTime.setHours(parseInt(hours), parseInt(minutes) - 10);
      reminderTime = dueDateTime.toTimeString().slice(0, 5);
    } else if (!reminderTime && data.isFullDay) {
      reminderTime = '09:00';
    }

    onSubmit({ ...data, reminderTime });
    handleReset();
  };

  const handleReset = () => {
    form.reset();
    setCurrentLabel('');
    setShowMoreOptions(false);
    setIsListening(false);
    onClose();
  };

  const handleAddLabel = () => {
    if (currentLabel.trim() && !form.getValues('labels').includes(currentLabel.trim())) {
      form.setValue('labels', [...form.getValues('labels'), currentLabel.trim()]);
      setCurrentLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    form.setValue('labels', form.getValues('labels').filter(label => label !== labelToRemove));
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Unsupported Browser",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsedData = parseVoiceCommand(transcript);

      console.log('Transcript:', transcript);
      console.log('Parsed Data:', parsedData);

      if (parsedData.subject) {
        form.setValue('subject', parsedData.subject, { shouldValidate: true });
      } else {
        form.setValue('subject', transcript, { shouldValidate: true });
      }

      if (parsedData.assignee) {
        form.setValue('assignee', parsedData.assignee, { shouldValidate: true });
      }
      if (parsedData.dueDate) {
        form.setValue('dueDate', parsedData.dueDate, { shouldValidate: true });
      }
      if (parsedData.dueTime) {
        form.setValue('dueTime', parsedData.dueTime, { shouldValidate: true });
        form.setValue('isFullDay', false);
      }
      
      toast({
        title: "Voice Input Processed",
        description: "Task details have been populated from your voice command.",
      });
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      toast({
        title: "Voice Input Error",
        description: `An error occurred: ${event.error}`,
        variant: "destructive",
      });
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const getTodayDate = () => new Date().toISOString().split('T')[0];

  const labels = form.watch('labels');
  const isFullDay = form.watch('isFullDay');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onValidSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Subject *</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input {...field} placeholder="Enter task subject" className="flex-1" />
                      <Button type="button" onClick={handleVoiceInput} variant="outline" size="sm" className={isListening ? 'bg-red-100' : ''}>
                        <Mic className="w-4 h-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Details</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter task details" rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assignee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter assignee name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date *</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} min={getTodayDate()} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isFullDay"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2 pt-2">
                  <FormControl>
                    <Switch
                      id="fullDay"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <Label htmlFor="fullDay">Full Day Task</Label>
                </FormItem>
              )}
            />

            {!isFullDay && (
              <FormField
                control={form.control}
                name="dueTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} placeholder="Default: 10 min before due time" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Label>Custom Labels</Label>
              <div className="flex gap-2">
                <Input
                  value={currentLabel}
                  onChange={(e) => setCurrentLabel(e.target.value)}
                  placeholder="Add label"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddLabel())}
                />
                <Button type="button" onClick={handleAddLabel} variant="outline" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {labels.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {labels.map((label, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => handleRemoveLabel(label)}
                    >
                      {label} ×
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Button type="button" onClick={() => setShowMoreOptions(!showMoreOptions)} variant="ghost" className="w-full">
              {showMoreOptions ? 'Hide' : 'Show'} More Options
            </Button>

            {showMoreOptions && (
              <div className="space-y-4 border-t pt-4">
                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linked URL (Optional)</FormLabel>
                      <FormControl>
                        <Input type="url" {...field} placeholder="https://example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="button" onClick={handleReset} variant="outline" className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {isEditing ? 'Save Changes' : 'Create Task'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskModal;
