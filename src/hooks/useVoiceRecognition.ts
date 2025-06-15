import { useState, useRef } from 'react';
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
  const recognitionRef = useRef<any>(null);

  const handleVoiceInput = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Unsupported Browser",
        description: "Speech recognition is not supported in this browser.",
        variant: "destructive",
      });
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      
      const finalTranscript = form.getValues('subject');
      if (finalTranscript) {
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
          
          toast({
            title: "Voice Input Processed",
            description: "Task details have been populated from your voice command.",
          });
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
       if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      let description = `An error occurred: ${event.error}.`;
      if (event.error === 'not-allowed') {
        description = "Microphone access was denied. Please enable it in your browser's settings for this site.";
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
      let transcript = '';
      for (let i = 0; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      form.setValue('subject', transcript, { shouldValidate: true });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  return { isListening, handleVoiceInput };
};
