
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseIntelligentVoiceInputProps {
  onResult: (transcript: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
}

export const useIntelligentVoiceInput = ({ onResult, inputRef }: UseIntelligentVoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const requestSystemVTT = useCallback(() => {
    // Check if we're in a Capacitor app (mobile)
    const isCapacitor = !!(window as any).Capacitor;
    
    if (isCapacitor && inputRef?.current) {
      // On mobile, focus the input field to trigger system keyboard
      const inputElement = inputRef.current;
      
      // Focus the input to show keyboard
      inputElement.focus();
      
      // Set a special attribute to hint that voice input is preferred
      inputElement.setAttribute('data-voice-input', 'true');
      
      // Check if the device has voice input capabilities
      const hasVoiceInput = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
      
      if (!hasVoiceInput) {
        toast({
          title: "Voice Input Setup Required",
          description: "To use voice input, please install 'Google Voice Typing' from the Play Store and enable it in your keyboard settings.",
          duration: 8000,
          action: {
            label: "Open Play Store",
            onClick: () => {
              // Try to open Play Store for Google Voice Typing
              const playStoreUrl = "market://details?id=com.google.android.googlequicksearchbox";
              const webPlayStoreUrl = "https://play.google.com/store/apps/details?id=com.google.android.googlequicksearchbox";
              
              try {
                window.open(playStoreUrl, '_system');
              } catch {
                window.open(webPlayStoreUrl, '_blank');
              }
            }
          }
        });
        return;
      }
      
      // Show instruction for system voice input
      toast({
        title: "Use System Voice Input",
        description: "Tap the microphone icon on your keyboard to start voice typing.",
        duration: 5000,
      });
      
      return;
    }
    
    // Fallback to browser-based voice recognition for web
    startBrowserVoiceRecognition();
  }, [inputRef, toast]);

  const startBrowserVoiceRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice Input Not Supported",
        description: "Speech recognition is not supported on this browser.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak now. The system will stop listening automatically.",
        duration: 3000,
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      
      if (event.error === 'not-allowed') {
        toast({
          title: "Voice Input Error",
          description: "Microphone access denied. Please enable microphone permissions in your browser settings.",
          variant: "destructive",
          duration: 8000,
        });
      } else if (event.error !== 'no-speech' && event.error !== 'aborted') {
        toast({
          title: "Voice Input Error",
          description: `Speech recognition error: ${event.error}`,
          variant: "destructive",
        });
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.start();
  }, [onResult, toast]);

  return {
    isListening,
    requestSystemVTT,
  };
};
