import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: ['.devtunnels.ms'], // allow access through VS Code port forwarding (dev tunnels)
  },
  build: {
    target: 'esnext', // allow for top-level-await
  },
  base: '/SAXR_Snap/',
});
