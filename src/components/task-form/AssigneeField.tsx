
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const AssigneeField = () => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="assignee"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assignee</FormLabel>
          <FormControl>
            <Input {...field} placeholder="Enter assignee name" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
