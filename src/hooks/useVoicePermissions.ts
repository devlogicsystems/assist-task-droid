
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useVoicePermissions = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);
  const { toast } = useToast();

  const checkAndRequestPermission = async (): Promise<boolean> => {
    setIsCheckingPermission(true);
    
    try {
      // For Capacitor/mobile apps, we need to check navigator.permissions
      if (navigator.permissions) {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        if (permissionStatus.state === 'granted') {
          setHasPermission(true);
          setIsCheckingPermission(false);
          return true;
        } else if (permissionStatus.state === 'denied') {
          setHasPermission(false);
          setIsCheckingPermission(false);
          toast({
            title: "Microphone Permission Denied",
            description: "Please enable microphone access in your device settings to use voice features.",
            variant: "destructive",
          });
          return false;
        }
      }

      // Try to get media stream to trigger permission request
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Permission granted, close the stream
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      setIsCheckingPermission(false);
      return true;
      
    } catch (error: any) {
      console.error('Voice permission error:', error);
      setHasPermission(false);
      setIsCheckingPermission(false);
      
      let description = "Unable to access microphone. Please check your device settings.";
      
      if (error.name === 'NotAllowedError') {
        description = "Microphone access was denied. Please enable it in your device settings and try again.";
      } else if (error.name === 'NotFoundError') {
        description = "No microphone found. Please ensure your device has a working microphone.";
      } else if (error.name === 'NotSupportedError') {
        description = "Voice input is not supported on this device or browser.";
      }
      
      toast({
        title: "Voice Input Error",
        description,
        variant: "destructive",
      });
      
      return false;
    }
  };

  useEffect(() => {
    // Check initial permission state
    if (navigator.permissions) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          setHasPermission(result.state === 'granted');
        })
        .catch(() => {
          // Permissions API not fully supported, will check on first use
          setHasPermission(null);
        });
    }
  }, []);

  return {
    hasPermission,
    isCheckingPermission,
    checkAndRequestPermission
  };
};
