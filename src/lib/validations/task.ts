
import * as z from 'zod';

const weeklyRecurrenceSchema = z.object({
  type: z.literal('weekly'),
  weekDay: z.number(),
});

const monthlyRecurrenceSchema = z.object({
  type: z.literal('monthly'),
  monthDay: z.number(),
});

const yearlyRecurrenceSchema = z.object({
  type: z.literal('yearly'),
  monthDate: z.object({
    month: z.number(),
    day: z.number(),
  }),
});

const recurrenceUnionSchema = z.discriminatedUnion('type', [
  weeklyRecurrenceSchema,
  monthlyRecurrenceSchema,
  yearlyRecurrenceSchema,
]);

export const taskFormSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  details: z.string().optional(),
  assignee: z.string().min(1, 'Assignee is required.'),
  dueDate: z.string().min(1, 'Due date is required.'),
  dueTime: z.string().optional(),
  reminderTime: z.string().optional(),
  isFullDay: z.boolean(),
  labels: z.array(z.string()),
  url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  recurrence: recurrenceUnionSchema.optional(),
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
