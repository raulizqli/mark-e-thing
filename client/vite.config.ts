// client/vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
  root: resolve(__dirname),
  build: {
    outDir: resolve(__dirname, '../public'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      '/searches': 'http://localhost:5175',
      '/health': 'http://localhost:5175',
      '/ready': 'http://localhost:5175',
    },
  },
});
