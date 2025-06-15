
import React, { useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { useTaskManager } from '@/hooks/useTaskManager';
import { taskFormSchema, TaskFormData } from '@/lib/validations/task';
import { mapTaskFormDataToTask } from '@/lib/taskUtils';

import { SubjectField } from '@/components/task-form/SubjectField';
import { DetailsField } from '@/components/task-form/DetailsField';
import { AssigneeField } from '@/components/task-form/AssigneeField';
import { LabelsField } from '@/components/task-form/LabelsField';
import { UrlField } from '@/components/task-form/UrlField';
import { RecurrenceField } from '@/components/task-form/RecurrenceField';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

const RecurringTaskForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { tasks, handleCreateTask, handleUpdateTask } = useTaskManager();
  const { toast } = useToast();

  const isEditing = Boolean(id);
  const taskToEdit = isEditing ? tasks.find(t => t.id === id) : undefined;

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      subject: '',
      details: '',
      assignee: '',
      dueDate: new Date().toISOString().split('T')[0], // This will be used as the starting point for recurrences
      dueTime: '',
      isFullDay: true,
      labels: [],
      url: '',
      recurrence: {
        type: 'weekly',
        weekDays: [new Date().getDay()],
      },
    },
  });

  useEffect(() => {
    if (isEditing && taskToEdit) {
      form.reset({
        subject: taskToEdit.subject,
        details: taskToEdit.details || '',
        assignee: taskToEdit.assignee,
        dueDate: taskToEdit.dueDate,
        dueTime: taskToEdit.dueTime || '',
        isFullDay: taskToEdit.isFullDay,
        labels: taskToEdit.labels,
        url: taskToEdit.url || '',
        recurrence: taskToEdit.recurrence || undefined
      });
    }
  }, [isEditing, taskToEdit, form]);

  const onSubmit = (data: TaskFormData) => {
    if (!data.recurrence) {
        toast({
            title: "Not a recurring task",
            description: "Please set the recurrence rules for the template.",
            variant: "destructive",
        });
        return;
    }
    // Forcing a valid due date for templates, though not displayed
    if (!data.dueDate) {
        data.dueDate = new Date().toISOString().split('T')[0];
    }
    
    if (isEditing && taskToEdit) {
      const updatedTask = mapTaskFormDataToTask(data, taskToEdit);
      handleUpdateTask(updatedTask);
    } else {
      handleCreateTask(data);
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit' : 'New'} Recurring Task Template</CardTitle>
          <CardDescription>
            {isEditing ? 'Update the template for this recurring task.' : 'Create a template for tasks that need to be repeated. Instances will be generated automatically based on these settings.'}
          </CardDescription>
        </CardHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto p-6">
              <SubjectField />
              <DetailsField />
              <AssigneeField />
              <LabelsField />
              <UrlField />
              <RecurrenceField forceRecurring={true} />
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="ghost" asChild>
                <Link to="/">Cancel</Link>
              </Button>
              <Button type="submit">{isEditing ? 'Update' : 'Create'} Template</Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
};

export default RecurringTaskForm;
