import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  // for dev
  server: {
    port: 3000,
    host: true, // to expose for ngrok
    allowedHosts: [
      "5650-2405-201-1014-3120-39c9-7ac7-6097-eb6e.ngrok-free.app",
      "aab9cd11f307.ngrok-free.app",
      "9dcaf44ae209.ngrok-free.app",
    ],
  },
  plugins: [react(), tailwindcss()],
  define: {
    global: "globalThis",
  },
  resolve: {
    alias: {
      buffer: "buffer",
    },
  },
  optimizeDeps: {
    include: ["buffer"],
  },
});
