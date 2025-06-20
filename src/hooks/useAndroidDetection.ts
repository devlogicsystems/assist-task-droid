
import { useState, useEffect } from 'react';

export const useAndroidDetection = () => {
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    // Check if we're in a Capacitor app (mobile)
    const isCapacitor = !!(window as any).Capacitor;
    
    // Check user agent for Android
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroidDevice = userAgent.includes('android');
    
    // We consider it Android if it's either a Capacitor app or Android user agent
    setIsAndroid(isCapacitor || isAndroidDevice);
  }, []);

  return isAndroid;
};
