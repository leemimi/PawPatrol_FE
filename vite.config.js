// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
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

// 백그라운드 메시지 핸들러 - notification 필드가 있는 메시지는 처리하지 않도록 함
messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
});`;

      // Ensure public directory exists
      if (!fs.existsSync('public')) {
        fs.mkdirSync('public');
      }

      // Write service worker file to public directory
      fs.writeFileSync('public/firebase-messaging-sw.js', swContent);
      console.log('Created firebase-messaging-sw.js in public directory');
    },
    closeBundle() {
      // Ensure the service worker is also copied to the dist directory for production
      if (fs.existsSync('public/firebase-messaging-sw.js') && fs.existsSync('dist')) {
        fs.copyFileSync('public/firebase-messaging-sw.js', 'dist/firebase-messaging-sw.js');
        console.log('Copied firebase-messaging-sw.js to dist directory for production');
      }
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    createServiceWorker(), // Add the service worker plugin
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        id: 'com.jellyjujoday.pawpatrol',
        name: '젤리구조대',
        short_name: '젤리구조대',
        description: '잃어버린 강아지/고양이를 찾아주는 앱',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        screenshots: [
          {
            src: 'screenshot1.png',
            sizes: '1280x720',
            type: 'image/png',
            label: '젤리구조대 메인 화면'
          },
          {
            src: 'screenshot2.png',
            sizes: '1280x720',
            type: 'image/png',
            label: '실종 동물 검색 화면'
          }
        ],
        launch_handler: {
          client_mode: 'auto'
        }
      },
      workbox: {
        exclude: [/firebase-messaging-sw\.js$/],
        navigateFallbackDenylist: [/^\/firebase-messaging-sw\.js$/]
      }
    })
  ],
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
        target: 'https://www.api.pawpatrols.shop',
        changeOrigin: true
      }
    }
  },
  build: {
    // Ensure the service worker is accessible at root level after build
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
});
