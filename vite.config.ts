import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: [
      '601d4ae52651.ngrok-free.app', // ✅ Add your current ngrok subdomain here
      '268ff0e7b5bc.ngrok-free.app',
      '5da210de520d.ngrok-free.app',
      'bf9ddc02dbe7.ngrok-free.app',
    ],
  },
});
