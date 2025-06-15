
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.pragmatasks.app',
  appName: 'PragmaTasks - Task Management',
  webDir: 'dist',
  server: {
    url: 'https://479a32dc-cf91-4f14-827f-c1286d2cd06a.lovableproject.com?forceHideBadge=true',
    cleartext: true,
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: '#1976D2',
      showSpinner: true,
      spinnerColor: '#ffffff'
    }
  }
};

export default config;
