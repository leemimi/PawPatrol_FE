import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
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