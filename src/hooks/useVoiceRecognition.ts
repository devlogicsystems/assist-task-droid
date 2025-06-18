
import { useState, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { parseVoiceCommand } from '@/lib/voiceParser';
import { UseFormReturn } from 'react-hook-form';
import { TaskFormData } from '@/lib/validations/task';
import { useVoicePermissions } from './useVoicePermissions';

interface UseVoiceRecognitionProps {
  form: UseFormReturn<TaskFormData>;
  fieldName: keyof TaskFormData;
  parseCommand?: boolean;
}

export const useVoiceRecognition = ({ form, fieldName, parseCommand = false }: UseVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);
  const { checkAndRequestPermission } = useVoicePermissions();

  const handleVoiceInput = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    // Check and request permission first
    const hasPermission = await checkAndRequestPermission();
    if (!hasPermission) {
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Unsupported Feature",
        description: "Speech recognition is not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      
      if (parseCommand) {
        const finalTranscript = form.getValues(fieldName);
        if (finalTranscript && typeof finalTranscript === 'string') {
            const parsedData = parseVoiceCommand(finalTranscript);

            console.log('Final Transcript:', finalTranscript);
            console.log('Parsed Data:', parsedData);

            if (parsedData.subject) {
              form.setValue('subject', parsedData.subject, { shouldValidate: true });
            }
      
            if (parsedData.assignee) {
              form.setValue('assignee', parsedData.assignee, { shouldValidate: true });
            }
            if (parsedData.dueDate) {
              form.setValue('dueDate', parsedData.dueDate, { shouldValidate: true });
            }

            if (parsedData.isFullDay) {
              form.setValue('isFullDay', true, { shouldValidate: true });
              form.setValue('dueTime', '', { shouldValidate: true });
            } else if (parsedData.dueTime) {
              form.setValue('dueTime', parsedData.dueTime, { shouldValidate: true });
              form.setValue('isFullDay', false, { shouldValidate: true });
            }
            
            if (parsedData.reminderTime) {
              form.setValue('reminderTime', parsedData.reminderTime, { shouldValidate: true });
            }
            
            toast({
              title: "Voice Input Processed",
              description: "Task details have been populated from your voice command.",
            });
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      recognitionRef.current = null;
      
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      
      let description = `An error occurred: ${event.error}.`;
      if (event.error === 'not-allowed') {
        description = "Microphone access was denied. Please enable microphone permissions in your device settings.";
      } else if (event.error === 'audio-capture') {
        description = "Audio capture failed. Please check if your microphone is working correctly.";
      } else if (event.error === 'service-not-allowed') {
        description = "Speech recognition service is not available. Please check your internet connection.";
      }
      
      toast({
        title: "Voice Input Error",
        description,
        variant: "destructive",
      });
    };

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      form.setValue(fieldName, transcript, { shouldValidate: true });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return { isListening, handleVoiceInput };
};
