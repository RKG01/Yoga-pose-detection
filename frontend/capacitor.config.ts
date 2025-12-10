import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yoga.detection',
  appName: 'Yoga Pose Detection',
  webDir: 'build',
  server: {
    androidScheme: 'https'
  }
};

export default config;
