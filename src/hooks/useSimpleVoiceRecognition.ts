
import { useState, useCallback, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";

interface UseSimpleVoiceRecognitionProps {
  onResult: (transcript: string) => void;
}

export const useSimpleVoiceRecognition = ({ onResult }: UseSimpleVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current) {
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
      onResult(transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onResult, toast, stopListening]);

  return { isListening, startListening, stopListening };
};
