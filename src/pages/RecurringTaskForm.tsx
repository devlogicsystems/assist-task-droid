
import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useTaskManager } from '@/hooks/useTaskManager';
import { taskSchema, TaskFormData } from '@/lib/validations/task';

import { SubjectField } from '@/components/task-form/SubjectField';
import { DetailsField } from '@/components/task-form/DetailsField';
import { AssigneeField } from '@/components/task-form/AssigneeField';
import { DueDateFields } from '@/components/task-form/DueDateFields';
import { LabelsField } from '@/components/task-form/LabelsField';
import { UrlField } from '@/components/task-form/UrlField';
import { RecurrenceField } from '@/components/task-form/RecurrenceField';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

const RecurringTaskForm = () => {
  const navigate = useNavigate();
  const { handleCreateTask } = useTaskManager();
  const { toast } = useToast();

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      subject: '',
      details: '',
      assignee: '',
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '',
      isFullDay: true,
      labels: [],
      url: '',
      recurrence: {
        type: 'weekly',
        weekDay: new Date().getDay(),
      },
    },
  });

  const onSubmit = (data: TaskFormData) => {
    if (!data.recurrence) {
        toast({
            title: "Not a recurring task",
            description: "Please set the recurrence rules for the template.",
            variant: "destructive",
        });
        return;
    }
    handleCreateTask(data);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>New Recurring Task Template</CardTitle>
          <CardDescription>
            Create a template for tasks that need to be repeated. Instances will be generated automatically based on these settings.
          </CardDescription>
        </CardHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto p-6">
              <SubjectField />
              <DetailsField />
              <AssigneeField />
              <DueDateFields />
              <LabelsField />
              <UrlField />
              <RecurrenceField forceRecurring={true} />
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-6">
              <Button type="button" variant="ghost" asChild>
                <Link to="/">Cancel</Link>
              </Button>
              <Button type="submit">Create Template</Button>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
};

export default RecurringTaskForm;
