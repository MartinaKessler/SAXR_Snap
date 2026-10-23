import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    // allow access through VS Code port forwarding (dev tunnels)
    allowedHosts: ['.devtunnels.ms'],
  },
});
