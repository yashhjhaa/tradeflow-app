import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Robustly try to find the API Key from various common naming conventions
  // This handles local .env files and cloud deployment vars (Vercel, Netlify, etc.)
  const apiKey = env.API_KEY || env.VITE_API_KEY || env.GOOGLE_API_KEY || env.VITE_GOOGLE_API_KEY || '';

  return {
    plugins: [react()],
    define: {
      // Define process.env.API_KEY globally for the client build
      'process.env.API_KEY': JSON.stringify(apiKey),
      // NOTE: Removed empty 'process.env': {} to avoid overwriting the specific API key replacement logic in some bundler versions
    },
    build: {
      outDir: 'dist',
      sourcemap: false
    }
  }
})
