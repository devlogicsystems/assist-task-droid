
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const DetailsField = () => {
  const form = useFormContext();

  return (
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
  );
};
