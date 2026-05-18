import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite config - React + path aliases
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep React + React DOM + Router together (Router needs React context)
          if (id.includes('node_modules/react/')      ||
              id.includes('node_modules/react-dom/')  ||
              id.includes('node_modules/react-router')||
              id.includes('node_modules/scheduler/')) {
            return 'react-vendor';
          }
          if (id.includes('node_modules/firebase/'))      return 'firebase';
          if (id.includes('node_modules/framer-motion/')) return 'motion';
          if (id.includes('node_modules/socket.io-client/')) return 'socket';
          if (id.includes('node_modules/lucide-react/'))  return 'icons';
        },
      },
    },
  },
  server: {
    port: 5173,
    open: true,
    proxy: {
      '/api/auth':         { target: 'http://localhost:3001', changeOrigin: true, rewrite: (p) => p.replace('/api/auth', '') },
      '/api/users':        { target: 'http://localhost:3002', changeOrigin: true, rewrite: (p) => p.replace('/api/users', '') },
      '/api/workers':      { target: 'http://localhost:3003', changeOrigin: true, rewrite: (p) => p.replace('/api/workers', '') },
      '/api/bookings':     { target: 'http://localhost:3004', changeOrigin: true, rewrite: (p) => p.replace('/api/bookings', '') },
      '/api/payments':     { target: 'http://localhost:3006', changeOrigin: true, rewrite: (p) => p.replace('/api/payments', '') },
      '/api/ai':           { target: 'http://localhost:3007', changeOrigin: true, rewrite: (p) => p.replace('/api/ai', '') },
      '/api/admin':        { target: 'http://localhost:3008', changeOrigin: true, rewrite: (p) => p.replace('/api/admin', '') },
      '/api/notifications':{ target: 'http://localhost:3005', changeOrigin: true, rewrite: (p) => p.replace('/api/notifications', '') },
    },
  },
});
