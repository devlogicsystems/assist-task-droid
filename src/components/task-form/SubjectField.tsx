
import React, { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { TaskFormData } from '@/lib/validations/task';
import { useIntelligentVoiceInput } from '@/hooks/useIntelligentVoiceInput';

export const SubjectField = () => {
  const form = useFormContext<TaskFormData>();
  const inputRef = useRef<HTMLInputElement>(null);

  const { isListening, requestSystemVTT } = useIntelligentVoiceInput({
    onResult: (transcript) => {
      form.setValue('subject', transcript, { shouldValidate: true });
    },
    inputRef: inputRef,
  });

  return (
    <FormField
      control={form.control}
      name="subject"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Task Subject *</FormLabel>
          <FormControl>
            <div className="flex gap-2">
              <Input 
                {...field} 
                ref={inputRef}
                placeholder="Enter task subject" 
                className="flex-1" 
              />
              <Button 
                type="button" 
                onClick={requestSystemVTT} 
                variant="outline" 
                size="sm" 
                className={isListening ? 'bg-red-100' : ''}
                disabled={isListening}
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
