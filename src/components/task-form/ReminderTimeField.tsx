
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const ReminderTimeField = () => {
  const form = useFormContext();

  return (
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
  );
};
