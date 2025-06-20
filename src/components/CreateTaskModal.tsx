
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useVoiceRecognition } from '@/hooks/useVoiceRecognition';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form } from '@/components/ui/form';
import { taskFormSchema, TaskFormData } from '@/lib/validations/task';
import { Task, TaskStatus } from '@/types/task';

import { SubjectField } from './task-form/SubjectField';
import { DetailsField } from './task-form/DetailsField';
import { AssigneeField } from './task-form/AssigneeField';
import { DueDateFields } from './task-form/DueDateFields';
import { ReminderTimeField } from './task-form/ReminderTimeField';
import { LabelsField } from './task-form/LabelsField';
import { UrlField } from './task-form/UrlField';
import { RecurrenceField } from './task-form/RecurrenceField';
import { StatusField } from './task-form/StatusField';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: TaskFormData, status?: TaskStatus) => void;
  taskToEdit?: Task | null;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  taskToEdit,
}) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>('assigned');
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
      recurrence: undefined,
    },
  });

  const { 
    isListening: isSubjectListening, 
    handleVoiceInput: handleSubjectVoiceInput 
  } = useVoiceRecognition({ 
    form,
    fieldName: 'subject',
    parseCommand: true,
  });

  const { 
    isListening: isDetailsListening, 
    handleVoiceInput: handleDetailsVoiceInput 
  } = useVoiceRecognition({
    form,
    fieldName: 'details',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditing && taskToEdit) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { recurrence: taskRecurrence, ...restTask } = taskToEdit;
        let formRecurrence: TaskFormData['recurrence'] = undefined;
        if (taskRecurrence) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { interval, endDate, ...rest } = taskRecurrence;
          formRecurrence = rest;
        }

        form.reset({
          ...restTask,
          details: taskToEdit.details || '',
          dueTime: taskToEdit.dueTime || '',
          reminderTime: taskToEdit.reminderTime || '',
          labels: taskToEdit.labels || [],
          url: taskToEdit.url || '',
          recurrence: formRecurrence,
        });

        setCurrentStatus(taskToEdit.status);

        if(taskToEdit.url || taskToEdit.recurrence) {
          setShowMoreOptions(true);
        }
      } else {
        form.reset();
        setShowMoreOptions(false);
        setCurrentStatus('assigned');
      }
    }
  }, [isOpen, isEditing, taskToEdit, form]);

  const onValidSubmit = (data: TaskFormData) => {
    let reminderTime = data.reminderTime;
    if (!reminderTime && data.dueTime && !data.isFullDay) {
      const [hours, minutes] = data.dueTime.split(':').map(Number);
      const dueDateTime = new Date();
      dueDateTime.setHours(hours, minutes - 10);
      reminderTime = `${String(dueDateTime.getHours()).padStart(2, '0')}:${String(dueDateTime.getMinutes()).padStart(2, '0')}`;
    } else if (!reminderTime && data.isFullDay) {
      reminderTime = '10:00';
    }

    onSubmit({ ...data, reminderTime }, isEditing ? currentStatus : undefined);
    handleReset();
  };

  const handleReset = () => {
    form.reset();
    setShowMoreOptions(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleReset}>
      <DialogContent className="w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onValidSubmit)} className="space-y-4">
            {isEditing && taskToEdit && (
              <StatusField 
                value={currentStatus} 
                onChange={setCurrentStatus}
                isClosedTask={taskToEdit.status === 'closed'}
              />
            )}
            <SubjectField />
            <DetailsField />
            <AssigneeField />
            <DueDateFields />
            <ReminderTimeField />
            <LabelsField />

            <Button type="button" onClick={() => setShowMoreOptions(!showMoreOptions)} variant="ghost" className="w-full">
              {showMoreOptions ? 'Hide' : 'Show'} More Options
            </Button>

            {showMoreOptions && (
              <div className="space-y-4 border-t pt-4">
                <UrlField />
                <RecurrenceField />
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
