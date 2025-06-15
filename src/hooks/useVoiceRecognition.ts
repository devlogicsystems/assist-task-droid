
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { parseVoiceCommand } from '@/lib/voiceParser';
import { UseFormReturn } from 'react-hook-form';
import { TaskFormData } from '@/lib/validations/task';

interface UseVoiceRecognitionProps {
  form: UseFormReturn<TaskFormData>;
}

export const useVoiceRecognition = ({ form }: UseVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Unsupported Browser",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      let description = `An error occurred: ${event.error}.`;
      if (event.error === 'not-allowed') {
        description = "Microphone access was denied. Please enable it in your browser's settings for this site.";
      } else if (event.error === 'no-speech') {
        description = "No speech was detected. Please try speaking again.";
      } else if (event.error === 'audio-capture') {
        description = "Audio capture failed. Please check if your microphone is working correctly.";
      } else if (event.error === 'service-not-allowed') {
        description = "Speech recognition service is not allowed. This may be due to security settings or an insecure connection. Please use HTTPS.";
      }
      toast({
        title: "Voice Input Error",
        description,
        variant: "destructive",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const parsedData = parseVoiceCommand(transcript);

      console.log('Transcript:', transcript);
      console.log('Parsed Data:', parsedData);

      if (parsedData.subject) {
        form.setValue('subject', parsedData.subject, { shouldValidate: true });
      } else {
        form.setValue('subject', transcript, { shouldValidate: true });
      }

      if (parsedData.assignee) {
        form.setValue('assignee', parsedData.assignee, { shouldValidate: true });
      }
      if (parsedData.dueDate) {
        form.setValue('dueDate', parsedData.dueDate, { shouldValidate: true });
      }
      if (parsedData.dueTime) {
        form.setValue('dueTime', parsedData.dueTime, { shouldValidate: true });
        form.setValue('isFullDay', false);
      }
      
      toast({
        title: "Voice Input Processed",
        description: "Task details have been populated from your voice command.",
      });
    };

    recognition.start();
  };

  return { isListening, handleVoiceInput };
};
