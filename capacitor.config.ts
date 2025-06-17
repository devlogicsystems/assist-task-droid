
import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'com.ictasks.app',
  appName: 'ICTasks',
  webDir: 'dist',
  server: {
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
