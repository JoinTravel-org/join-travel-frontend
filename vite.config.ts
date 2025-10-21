import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0", // Permite conexiones externas en Docker
    port: 3060,
    watch: {
      usePolling: true, // Necesario para hot reload en Docker
    },
  },
  optimizeDeps: {
    include: ['@googlemaps/react-wrapper', '@googlemaps/js-api-loader']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'google-maps': ['@googlemaps/react-wrapper', '@googlemaps/js-api-loader']
        }
      }
    }
  }
});
