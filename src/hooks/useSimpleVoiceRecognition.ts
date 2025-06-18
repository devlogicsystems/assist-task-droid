
import { useState, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseSimpleVoiceRecognitionProps {
  onResult: (transcript: string) => void;
}

export const useSimpleVoiceRecognition = ({ onResult }: UseSimpleVoiceRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  const requestPermissionAndStart = useCallback(async () => {
    try {
      // Check if we're in a Capacitor app (mobile)
      const isCapacitor = !!(window as any).Capacitor;
      
      if (isCapacitor) {
        // For Capacitor apps, the permissions should be handled by the native layer
        toast({
          title: "Requesting Microphone Access",
          description: "Please allow microphone access when prompted by your device.",
          duration: 3000,
        });
      }

      // Request microphone permission
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Voice Input Not Supported",
          description: "Speech recognition is not supported on this device.",
          variant: "destructive",
        });
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      
      let description = "Unable to access microphone.";
      if (error.name === 'NotAllowedError') {
        const isCapacitor = !!(window as any).Capacitor;
        if (isCapacitor) {
          description = "Microphone access denied. Please:\n\n1. Go to your device Settings\n2. Find ICTasks app\n3. Enable Microphone permission\n4. Restart the app";
        } else {
          description = "Microphone access denied. Please enable microphone permissions in your browser settings.";
        }
      } else if (error.name === 'NotFoundError') {
        description = "No microphone found on this device.";
      }
      
      toast({
        title: "Voice Input Error",
        description,
        variant: "destructive",
        duration: 8000,
      });
      return false;
    }
  }, [toast]);

  const startListening = useCallback(async () => {
    if (recognitionRef.current) return;

    // Check for speech recognition support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Input Not Supported",
        description: "Speech recognition is not supported on this browser.",
        variant: "destructive",
      });
      return;
    }

    // Request permission first
    const hasAccess = await requestPermissionAndStart();
    if (!hasAccess) {
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      recognitionRef.current = null;
      
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      
      let description = "Speech recognition error occurred.";
      if (event.error === 'not-allowed') {
        const isCapacitor = !!(window as any).Capacitor;
        if (isCapacitor) {
          description = "Microphone access denied. Please enable microphone permission for ICTasks in your device settings and restart the app.";
        } else {
          description = "Microphone access denied. Please enable microphone permissions in your browser settings.";
        }
      }
      
      toast({
        title: "Voice Input Error",
        description,
        variant: "destructive",
        duration: 8000,
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
  }, [requestPermissionAndStart, onResult, toast]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return {
    isListening,
    startListening,
    stopListening
  };
};
