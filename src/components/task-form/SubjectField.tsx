
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TaskFormData } from '@/lib/validations/task';

interface SubjectFieldProps {
  isListening?: boolean;
  handleVoiceInput?: () => void;
}

export const SubjectField = ({ isListening, handleVoiceInput }: SubjectFieldProps) => {
  const form = useFormContext<TaskFormData>();

  return (
    <FormField
      control={form.control}
      name="subject"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Task Subject *</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Input {...field} placeholder="Enter task subject" className="flex-1" />
              {handleVoiceInput && (
                <Button type="button" onClick={handleVoiceInput} variant="outline" size="sm" className={isListening ? 'bg-red-100' : ''}>
                  <Mic className="w-4 h-4" />
                </Button>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
