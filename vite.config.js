import { defineConfig } from 'vite';
export default defineConfig({
  base: './',
  server: { proxy: { '/api': { target: 'https://fortnite-api.com', changeOrigin: true, rewrite: p => p.replace(/^\/api/, '/v2') } } }
});
