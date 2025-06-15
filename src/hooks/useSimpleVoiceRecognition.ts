
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
      onResult(transcript);
    };

    recognition.start();
  }, [onResult, toast]);

  return { isListening, startListening };
};
