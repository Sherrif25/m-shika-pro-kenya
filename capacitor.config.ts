import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.lovable.mshikaprokenya',
  appName: 'm-shika-pro-kenya',
  webDir: 'dist',
  server: {
    url: 'https://683804a1-387f-4ba6-b92e-30de050826a9.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#1a1a1a",
      showSpinner: false
    }
  }
};

export default config;