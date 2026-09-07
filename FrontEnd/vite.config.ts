import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({

  server: {
    host: true,
    allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app', '.trycloudflare.com'],
  },

  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    injectRegister: false,

    pwaAssets: {
      disabled: false,
      config: true,
    },

    manifest: {
      name: 'MIP',
      short_name: 'MIP',
      description: 'mip',
      theme_color: '#1594C7',
      background_color: '#1594C7',
      display: 'standalone',
    },

    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}'],
      cleanupOutdatedCaches: true,
      clientsClaim: true,
    },

    devOptions: {
      enabled: true,
      navigateFallback: 'index.html',
      suppressWarnings: true,
      type: 'module',
    },
  })],
})
