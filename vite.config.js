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
      strategies: 'generateSW',  // 명시적으로 전략 설정
      devOptions: {
        enabled: true,
        type: 'module',
        navigateFallback: 'index.html'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,json}'],
        navigationPreload: true,
        // globIgnores 사용하여 firebase-messaging-sw.js 제외
        globIgnores: ['**/firebase-messaging-sw.js'],
        runtimeCaching: [
          {
            // 이미지 파일에 대한 캐싱 전략
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30일
              },
            },
          },
          {
            // API 요청에 대한 캐싱 전략
            urlPattern: /^https:\/\/api.pawpatrols\.shop\/api/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 24 * 60 * 60, // 1일
              },
            },
          },
          {
            // 폰트에 대한 캐싱
            urlPattern: /\.(?:woff|woff2|ttf|otf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1년
              },
            },
          },
          {
            // 기타 리소스에 대한 기본 캐싱
            urlPattern: /.*$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'others-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
              },
            },
          },
        ],
      },
      // Firebase 메시징 서비스 워커와 공존하도록 이름 변경
      filename: 'pwa-sw.js',
      injectRegister: 'script',
      selfDestroying: false,  // 자동 제거 방지
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
        target: 'http://localhost:8090',
        changeOrigin: true
      }
    }
  }
});