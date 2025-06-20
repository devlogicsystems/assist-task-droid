
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
  },
  android: {
    permissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.MODIFY_AUDIO_SETTINGS'
    ],
    icon: 'public/lovable-uploads/5f55ff69-a65d-45fa-b743-8be28fec7025.png'
  }
};

export default config;
