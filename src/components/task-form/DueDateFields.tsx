
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const DueDateFields = () => {
  const form = useFormContext();
  const isFullDay = form.watch('isFullDay');

  return (
    <>
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
    </>
  );
};
