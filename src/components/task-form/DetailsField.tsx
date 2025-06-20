
import React, { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useIntelligentVoiceInput } from '@/hooks/useIntelligentVoiceInput';

export const DetailsField = () => {
  const form = useFormContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isListening, requestSystemVTT } = useIntelligentVoiceInput({
    onResult: (transcript) => {
      form.setValue('details', transcript, { shouldValidate: true });
    },
    inputRef: textareaRef,
  });

  return (
    <FormField
      control={form.control}
      name="details"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Brief Details</FormLabel>
          <FormControl>
            <div className="relative">
              <Textarea 
                {...field} 
                ref={textareaRef}
                placeholder="Enter task details" 
                rows={3} 
                className="pr-10" 
              />
              <Button
                type="button"
                onClick={requestSystemVTT}
                variant="ghost"
                size="icon"
                className={`absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground ${isListening ? 'text-red-500 hover:text-red-600' : ''}`}
                disabled={isListening}
              >
                <Mic className="h-4 w-4" />
              </Button>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
