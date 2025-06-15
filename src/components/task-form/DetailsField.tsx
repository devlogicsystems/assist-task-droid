
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface DetailsFieldProps {
  isListening?: boolean;
  handleVoiceInput?: () => void;
}

export const DetailsField = ({ isListening, handleVoiceInput }: DetailsFieldProps) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="details"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Brief Details</FormLabel>
          <FormControl>
            <div className="relative">
              <Textarea {...field} placeholder="Enter task details" rows={3} className="pr-10" />
              {handleVoiceInput && (
                <Button
                  type="button"
                  onClick={handleVoiceInput}
                  variant="ghost"
                  size="icon"
                  className={`absolute right-1 top-1 h-8 w-8 text-muted-foreground hover:text-foreground ${isListening ? 'text-red-500 hover:text-red-600' : ''}`}
                >
                  <Mic className="h-4 w-4" />
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
