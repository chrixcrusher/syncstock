import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    hot: true,
    watch: {
      usePolling: true,      // Use polling instead of events to detect file changes
      interval: 100,         // Polling interval in milliseconds
      // ignored: ['**/node_modules/**'] // Ignore changes in specific directories
    },
  },
  preview: {
    port: 3000
  }
})
