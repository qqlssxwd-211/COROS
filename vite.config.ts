import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api/coros/cn': {
        target: 'https://teamapi.coros.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/coros\/cn/, ''),
      },
      '/api/coros/eu': {
        target: 'https://teameuapi.coros.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/coros\/eu/, ''),
      },
      '/api/coros/us': {
        target: 'https://teamusapi.coros.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/coros\/us/, ''),
      },
      '/api/coros/asia': {
        target: 'https://teamapapi.coros.com',
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api\/coros\/asia/, ''),
      },
    },
  },
});
