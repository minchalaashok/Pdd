import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Required for Capacitor: all asset URLs must be relative so they load
  // correctly from the Android WebView file:// scheme.
  base: './',
  build: {
    outDir: 'dist',
    // Inline small assets to reduce file-system round trips in WebView
    assetsInlineLimit: 4096,
  },
})
