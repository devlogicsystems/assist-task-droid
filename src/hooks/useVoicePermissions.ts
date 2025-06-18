
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useVoicePermissions = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const { toast } = useToast();

  const checkAndRequestPermission = async (): Promise<boolean> => {
    if (isCheckingPermission) return false;
    
    setIsCheckingPermission(true);
    
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasPermission(false);
        setIsCheckingPermission(false);
        toast({
          title: "Voice Input Not Supported",
          description: "Your device or browser doesn't support voice input.",
          variant: "destructive",
        });
        return false;
      }

      // For mobile/Capacitor apps, request permission immediately
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      // Permission granted, close the stream immediately
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setIsCheckingPermission(false);
      
      return true;
      
    } catch (error: any) {
      console.error('Voice permission error:', error);
      setHasPermission(false);
      setIsCheckingPermission(false);
      
      let title = "Microphone Access Required";
      let description = "Please enable microphone access to use voice features.";
      
      if (error.name === 'NotAllowedError') {
        description = "Microphone access was denied. Please:\n\n• Tap the lock/settings icon in your browser's address bar\n• Enable microphone permissions\n• Refresh the page and try again\n\nFor mobile apps: Check your device's app permissions in Settings.";
      } else if (error.name === 'NotFoundError') {
        description = "No microphone found. Please ensure your device has a working microphone.";
      } else if (error.name === 'NotSupportedError') {
        description = "Voice input is not supported on this device or browser.";
      } else if (error.name === 'SecurityError') {
        description = "Microphone access blocked by security policy. Please check your browser settings.";
      }
      
      toast({
        title,
        description,
        variant: "destructive",
        duration: 8000,
      });
      
      return false;
    }
  };

  const openPermissionSettings = () => {
    toast({
      title: "Enable Microphone Access",
      description: "Please enable microphone permissions in your device settings or browser, then try again.",
      duration: 10000,
    });
  };

  useEffect(() => {
    // Check initial permission state without requesting
    if (navigator.permissions && 'query' in navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          setHasPermission(result.state === 'granted');
          
          // Listen for permission changes
          result.onchange = () => {
            setHasPermission(result.state === 'granted');
          };
        })
        .catch(() => {
          // Permissions API not supported, will check on first use
          setHasPermission(null);
        });
    }
  }, []);

  return {
    hasPermission,
    isCheckingPermission,
    checkAndRequestPermission,
    openPermissionSettings
  };
};
