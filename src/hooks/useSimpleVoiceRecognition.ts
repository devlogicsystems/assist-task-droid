
import { useState, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseSimpleVoiceRecognitionProps {
  onResult: (transcript: string) => void;
}

export const useSimpleVoiceRecognition = ({ onResult }: UseSimpleVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const startListening = useCallback(() => {
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
      toast({
        title: "Voice Input Error",
        description: `An error occurred: ${event.error}`,
        variant: "destructive",
      });
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.start();
  }, [onResult, toast]);

  return { isListening, startListening };
};
