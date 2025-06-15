
import * as z from 'zod';

const weeklyRecurrenceSchema = z.object({
  type: z.literal('weekly'),
  weekDays: z.array(z.number().min(0).max(6)).min(1, 'Please select at least one day.'),
});

const monthlyRecurrenceSchema = z.object({
  type: z.literal('monthly'),
  monthDays: z.array(z.number().min(1).max(31)).min(1, 'Please enter at least one day.'),
});

const yearlyRecurrenceSchema = z.object({
  type: z.literal('yearly'),
  yearDates: z.array(z.object({
    month: z.number().min(0).max(11),
    day: z.number().min(1).max(31),
  })).min(1, 'Please add at least one date.'),
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
  dueDate: z.string(),
  dueTime: z.string().optional(),
  reminderTime: z.string().optional(),
  isFullDay: z.boolean(),
  labels: z.array(z.string()),
  url: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  recurrence: recurrenceUnionSchema.optional(),
}).refine((data) => {
    if (!data.recurrence) {
        return data.dueDate && data.dueDate.length > 0;
    }
    return true;
}, {
    message: "Due date is required for non-recurring tasks.",
    path: ["dueDate"],
});

export type TaskFormData = z.infer<typeof taskFormSchema>;
