
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

export const UrlField = () => {
  const form = useFormContext();

  return (
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
  );
};
