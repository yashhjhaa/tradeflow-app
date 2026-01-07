import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // The third argument '' ensures we load ALL env vars, not just VITE_ prefixed ones
  const env = loadEnv(mode, process.cwd(), '');
  
  // Robustly try to find the API Key from various common naming conventions
  // Priority: System Environment (Deployment) -> Loaded .env file
  const apiKey = 
    process.env.API_KEY || 
    process.env.VITE_API_KEY || 
    process.env.GOOGLE_API_KEY || 
    env.API_KEY || 
    env.VITE_API_KEY || 
    env.GOOGLE_API_KEY || 
    '';

  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY globally for the client build
      'process.env.API_KEY': JSON.stringify(apiKey),
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})
