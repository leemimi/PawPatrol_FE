import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'


export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: '젤리구조대',
        short_name: '젤리구조대',
        description: '잃어버린 강아지/고양이를 찾아주는 앱',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone', // URL 창이 보이지 않게 설정
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
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
    proxy: {
      '/api': {
        target: 'http://localhost:8090',  // 스프링 부트 서버 주소
        changeOrigin: true
      }
    }
  }
})