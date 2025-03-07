import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Create service worker in public directory during build
const createServiceWorker = () => {
  return {
    name: 'create-service-worker',
    buildStart() {
      const swContent = `// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.4.0/firebase-messaging-compat.js');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGsITwSycgvFBn31D0shpfUVkJZXm8vQE",
  authDomain: "pawpatrol-2b0e3.firebaseapp.com",
  projectId: "pawpatrol-2b0e3",
  storageBucket: "pawpatrol-2b0e3.firebasestorage.app",
  messagingSenderId: "698844396749",
  appId: "1:698844396749:web:17ab47ff70369755047d84",
  measurementId: "G-HECG01QTQZ"
};

// Initialize Firebase in service worker scope
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'PawPatrol 알림';
  const notificationOptions = {
    body: payload.notification.body || '새로운 알림이 있습니다.',
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});`;

      // Ensure public directory exists
      if (!fs.existsSync('public')) {
        fs.mkdirSync('public');
      }

      // Write service worker file to public directory
      fs.writeFileSync('public/firebase-messaging-sw.js', swContent);
      console.log('Created firebase-messaging-sw.js in public directory');
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createServiceWorker() // Add the service worker plugin
  ],
  // Fix for "global is not defined" error
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'process': 'process/browser',
      'stream': 'stream-browserify',
      'util': 'util'
    },
  },
  server: {
    // Use this option for service worker
    headers: {
      'Service-Worker-Allowed': '/'
    },
    // Keep your original proxy settings
    proxy: {
      '/api': {
        target: 'http://localhost:8090',  // 스프링 부트 서버 주소
        changeOrigin: true
      }
    }
  }
});